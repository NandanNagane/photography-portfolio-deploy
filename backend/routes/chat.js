import express from "express";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Google Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// System message for the chatbot
const SYSTEM_MESSAGE = `You are a friendly and professional virtual assistant for an elegant photography studio.

Your role is to:
1. Warmly welcome visitors and engage them in conversation about their photography needs.
2. Share information about the studio's services: weddings, portraits, events, and family photography.
3. Describe the studio's artistic style: timeless, elegant, authentic, with masterful use of natural light.
4. Answer questions about packages and pricing when asked.
5. When you detect booking interest, guide the conversation step-by-step to collect lead information:
   - STEP 1: Ask what type of photography they're interested in (wedding, portrait, event, family)
   - STEP 2: Ask for their preferred date or timeframe
   - STEP 3: Ask for their name
   - STEP 4: Ask for their email or phone number for follow-up
6. Be natural - ask ONE question at a time based on what they've already shared.
7. Keep responses conversational, warm, and concise (2-3 sentences typically).

CRITICAL INSTRUCTION FOR LEAD CAPTURE:
When you have collected ALL of the following information from the user:
- Their name
- Their email OR phone number
- Their shoot type (wedding/portrait/event/family)

You MUST output the lead information in this EXACT format BEFORE your final message:

<LEAD_INFO>
{"name": "John Doe", "email": "john@example.com", "phone": "555-1234", "shoot_type": "portrait", "preferred_date": "next Sunday", "message": "LinkedIn profile photos"}
</LEAD_INFO>

IMPORTANT RULES:
1. The JSON must be valid (use double quotes, no trailing commas)
2. Put the <LEAD_INFO> block BEFORE your thank you message
3. Extract the actual name from phrases like "my name is X" or "I'm X" or "this is X"
4. Only output <LEAD_INFO> once you have name + (email OR phone) + shoot_type
5. The <LEAD_INFO> block is for internal processing - do NOT mention it in your response

EXAMPLE CONVERSATION:
User: "my name is Sarah and my email is sarah@email.com. I need wedding photos for June 15th"
You should respond:
<LEAD_INFO>
{"name": "Sarah", "email": "sarah@email.com", "phone": null, "shoot_type": "wedding", "preferred_date": "June 15th","preferred_time": "3:00 PM", "message": "wedding photos"}
</LEAD_INFO>

Wonderful, Sarah! Thank you for sharing your details. We'll review your wedding photography needs for June 15th and reach out to you within 24 hours at sarah@email.com to discuss packages and availability.

Now, be helpful, professional, and genuinely interested in their photography needs.`;

// Extract lead information from conversation history
function extractLeadFromHistory(history) {
  const lead = {
    name: null,
    email: null,
    phone: null,
    shoot_type: null,
    preferred_date: null,
    preferred_time: null,
    source: null,
    message: null
  };

  // Only look at the last 10 messages (5 exchanges) to avoid stale data
  const recentHistory = history.slice(-10);
  
  // Filter messages from the last 30 minutes to ensure fresh information
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const recentMessages = recentHistory.filter(msg => msg.timestamp >= thirtyMinutesAgo);
  
  // If no recent messages, don't extract lead (conversation is stale)
  if (recentMessages.length === 0) {
    return null;
  }
  
  // Extract from recent user messages only
  const userMessages = recentMessages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ');

  // Email regex
  const emailMatch = userMessages.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) lead.email = emailMatch[0];

  // Phone regex (various formats)
  const phoneMatch = userMessages.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) lead.phone = phoneMatch[0];

  // Extract shoot type
  const shootTypes = ['wedding', 'portrait', 'event', 'family'];
  for (const type of shootTypes) {
    if (userMessages.toLowerCase().includes(type)) {
      lead.shoot_type = type;
      break;
    }
  }

  // Extract name (look for "my name is" or "I'm" patterns)
  const nameMatch = userMessages.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (nameMatch) lead.name = nameMatch[1];

  // Check if we have at least contact info (email OR phone) and name
  const hasMinimumInfo = (lead.email || lead.phone) && lead.name;
  
  return hasMinimumInfo ? lead : null;
}

// Google Gemini AI integration
async function getLLMResponse(message, sessionId, history = [], db = null) {
  let leadInfo = null;
  let leadEvent = null; // Track if a lead was just created or updated
  
  try {
    if (process.env.GOOGLE_API_KEY) {
      // Build chat history with system message at the start
      const chatHistory = [
        {
          role: "user",
          parts: [{ text: SYSTEM_MESSAGE }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will extract lead information in the <LEAD_INFO> JSON format when I have collected name, contact info, and shoot type." }],
        },
        ...history.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ];
      
      // Use the chat API for multi-turn conversations
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: chatHistory,
      });

      // Send the current message
      const response = await chat.sendMessage({
        message: message,
      });
      
      // Extract text from response (it's a property)
      let responseText = response.text;
      
      console.log('🤖 RAW LLM Response:', responseText);
      
      // --- IMPROVED LLM-BASED LEAD EXTRACTION ---
      if (responseText.includes('<LEAD_INFO>')) {
        const jsonMatch = responseText.match(/<LEAD_INFO>\s*(\{[\s\S]*?\})\s*<\/LEAD_INFO>/);
        
        if (jsonMatch && jsonMatch[1]) {
          try {
            // Try to parse the JSON
            const extractedLead = JSON.parse(jsonMatch[1].trim());
            
            // Clean the JSON block from the user-facing response
            responseText = responseText.replace(/<LEAD_INFO>[\s\S]*?<\/LEAD_INFO>/, '').trim();

            // Validate minimum required fields
            if (extractedLead.name && (extractedLead.email || extractedLead.phone)) {
              leadInfo = {
                name: extractedLead.name,
                email: extractedLead.email || null,
                phone: extractedLead.phone || null,
                shoot_type: extractedLead.shoot_type || null,
                preferred_date: extractedLead.preferred_date || null,
                preferred_time: extractedLead.preferred_time || null,
                message: extractedLead.message || null
              };
              console.log('✅ Lead extracted by LLM:', leadInfo);
            } else {
              console.log('⚠️ LLM provided incomplete lead info:', extractedLead);
            }
          } catch (e) {
            console.error('⚠️ Failed to parse JSON from LLM response:', e);
            console.error('JSON string was:', jsonMatch[1]);
          }
        }
      } else {
        console.log('ℹ️ No <LEAD_INFO> tag found in LLM response');
      }

      // --- FALLBACK: REGEX-BASED EXTRACTION ---
      if (!leadInfo) {
        leadInfo = extractLeadFromHistory(history);
        if (leadInfo) {
          console.log('🔍 Lead extracted by regex fallback:', leadInfo);
        } else {
          console.log('ℹ️ No lead info extracted by regex either');
        }
      }

      // --- SAVE OR UPDATE LEAD IN DATABASE ---
      if (db && leadInfo) {
        try {
          const existingLead = await db.collection('leads').findOne({ session_id: sessionId });
          
          if (!existingLead) {
            const lead = {
              id: uuidv4(),
              session_id: sessionId,
              name: leadInfo.name,
              email: leadInfo.email,
              phone: leadInfo.phone,
              shoot_type: leadInfo.shoot_type,
              preferred_date: leadInfo.preferred_date,
              message: leadInfo.message,
              status: 'new',
              timestamp: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await db.collection('leads').insertOne(lead);
            console.log('✅ New lead saved:', lead.email || lead.phone, '| Name:', lead.name, '| Type:', lead.shoot_type);
            leadEvent = 'created'; // Set event flag for new lead
          } else {
            const updates = {};
            if (leadInfo.name && leadInfo.name !== existingLead.name) updates.name = leadInfo.name;
            if (leadInfo.email && leadInfo.email !== existingLead.email) updates.email = leadInfo.email;
            if (leadInfo.phone && leadInfo.phone !== existingLead.phone) updates.phone = leadInfo.phone;
            if (leadInfo.shoot_type && leadInfo.shoot_type !== existingLead.shoot_type) updates.shoot_type = leadInfo.shoot_type;
            if (leadInfo.preferred_date && leadInfo.preferred_date !== existingLead.preferred_date) updates.preferred_date = leadInfo.preferred_date;
            if (leadInfo.message && leadInfo.message !== existingLead.message) updates.message = leadInfo.message;
            
            if (Object.keys(updates).length > 0) {
              updates.updated_at = new Date().toISOString();
              await db.collection('leads').updateOne(
                { session_id: sessionId },
                { $set: updates }
              );
              console.log('✅ Lead updated for session:', sessionId, '| Updated fields:', Object.keys(updates).join(', '));
              leadEvent = 'updated'; // Set event flag for updated lead
            }
          }
        } catch (error) {
          console.error('⚠️ Failed to save lead:', error.message);
        }
      }

      return { responseText, leadInfo, leadEvent };
    }

    // Fallback: Simple rule-based responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! Welcome to our photography studio. I'm here to help you explore our services and find the perfect photography package for your needs. What type of photography are you interested in today?";
    }

    if (lowerMessage.includes("wedding")) {
      return "Our wedding photography captures the timeless beauty and authentic emotions of your special day. We offer comprehensive packages ranging from intimate ceremonies to full-day coverage with multiple photographers. Would you like to hear about our wedding packages and pricing?";
    }

    if (lowerMessage.includes("portrait")) {
      return "Our portrait sessions reveal personality and character through masterful lighting and composition. Whether it's professional headshots, family portraits, or individual sessions, we create images you'll treasure. Are you interested in learning about our portrait packages?";
    }

    if (
      lowerMessage.includes("package") ||
      lowerMessage.includes("pricing") ||
      lowerMessage.includes("price")
    ) {
      return "We offer three main packages: Essential ($599 - perfect for intimate sessions), Premium ($1,299 - our most popular for weddings), and Signature ($2,499 - complete luxury coverage). Each includes edited high-resolution images and online galleries. Would you like detailed information about any specific package?";
    }

    if (
      lowerMessage.includes("book") ||
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("appointment")
    ) {
      return "Wonderful! I'd love to help you schedule a session. What type of shoot are you interested in (wedding, portrait, event, or family)? And do you have a preferred date or timeframe in mind?";
    }

    if (lowerMessage.includes("event")) {
      return "We provide dynamic coverage of corporate events, celebrations, and special occasions. Our team captures the energy and key moments that tell your event's story. What type of event are you planning?";
    }

    return { 
      responseText: "Thank you for your interest! I'm here to help you with information about our photography services, packages, pricing, or to schedule a consultation. What would you like to know more about?",
      leadInfo: null
    };
  } catch (error) {
    console.error("LLM API error:", error.message);
    return { 
      responseText: "I'm here to help you with our photography services. Could you tell me more about what type of photography you're interested in - weddings, portraits, events, or family sessions?",
      leadInfo: null
    };
  }
}

// POST /api/chat - Handle chat messages
router.post("/chat", async (req, res) => {
  try {
    const { session_id, message } = req.body;
    const db = req.app.locals.db;

    if (!session_id || !message) {
      return res.status(400).json({
        error: "Missing required fields: session_id and message",
      });
    }

    // Save user message
    const userMessage = {
      id: uuidv4(),
      session_id,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    await db.collection("messages").insertOne(userMessage);

    // Get chat history for context
    const history = await db
      .collection("messages")
      .find({ session_id })
      .sort({ timestamp: 1 })
      .limit(20)
      .toArray();

    // Get LLM response, lead info, and lead event in one call
    const { responseText, leadInfo, leadEvent } = await getLLMResponse(message, session_id, history, db);

    // Save assistant response
    const assistantMessage = {
      id: uuidv4(),
      session_id,
      role: "assistant",
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    await db.collection("messages").insertOne(assistantMessage);

    // Use the leadInfo returned from getLLMResponse directly (no redundant DB query)
    const leadCaptured = !!leadInfo;

    res.json({
      response: responseText,
      session_id,
      lead_captured: leadCaptured,
      lead_event: leadEvent, // Send the event flag to frontend (null, 'created', or 'updated')
      lead_info: leadCaptured ? {
        has_email: !!leadInfo.email,
        has_phone: !!leadInfo.phone,
        has_name: !!leadInfo.name,
        shoot_type: leadInfo.shoot_type
      } : null
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      details: error.message,
    });
  }
});



//not used this yet for previously saved messages and chats
// GET /api/messages/:session_id - Get chat history
router.get("/messages/:session_id", async (req, res) => {
  try {
    const { session_id } = req.params;
    const db = req.app.locals.db;

    const messages = await db
      .collection("messages")
      .find({ session_id }, { projection: { _id: 0 } })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      error: "Failed to retrieve messages",
      details: error.message,
    });
  }
});

export default router;
