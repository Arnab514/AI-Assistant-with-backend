import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Generate options endpoint
app.post('/api/generate-options', async (req, res) => {
  try {
    const { query } = req.body;
    const prompt = `Based on this query: "${query}", generate exactly 3 unique and creative numbered options. Format them exactly like this with numbering and bold fonts:
    1. First option
    2. Second option
    3. Third option`;

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
      method: "post",
      data: {
        contents: [{ parts: [{ text: prompt }] }],
      },
    });

    const options = response.data.candidates[0].content.parts[0].text;
    res.json({ options });
  } catch (error) {
    console.error('Error generating options:', error);
    res.status(500).json({ error: 'Failed to generate options' });
  }
});

// Generate detailed response endpoint
app.post('/api/generate-detailed-response', async (req, res) => {
  try {
    const { query, selectedOptions } = req.body;
    const prompt = `For the following selected options from the query "${query}":

${selectedOptions.join("\n")}

Provide detailed suggestions for each option. Format the response EXACTLY like this, including the exact spacing and markdown:

**For [Selected Option 1]**
• Add specific feature details here
• Include target audience information
• Provide implementation steps and marketing strategy

**For [Selected Option 2]**
• Add specific feature details here
• Include target audience information
• Provide implementation steps and marketing strategy

Note: Replace the bullet points with real, detailed suggestions specific to each option. Each bullet point should be a complete sentence with actionable information. And each bullet points should start from a new line`;

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
      method: "post",
      data: {
        contents: [{ parts: [{ text: prompt }] }],
      },
    });

    const result = response.data.candidates[0].content.parts[0].text;
    const formattedResult = result.split('\n').map(line => {
      if (line.startsWith('For ')) {
        return `**${line}**`;
      }
      if (line.trim().startsWith('•')) {
        return line;
      }
      if (line.trim().startsWith('-')) {
        return line.replace('-', '•');
      }
      return line;
    }).join('\n');

    res.json({ response: formattedResult });
  } catch (error) {
    console.error('Error generating detailed response:', error);
    res.status(500).json({ error: 'Failed to generate detailed response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import axios from 'axios';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // Helper function to analyze option priority
// async function analyzeOptionPriority(query, option) {
//   const prompt = `Analyze this option: "${option}" in context of the query: "${query}"
  
//   Rate on a scale of 1-5 (1 being best) for each criteria:
//   - Relevance: How well does it align with the query?
//   - Impact: What's the potential ROI or significance?
//   - Feasibility: How easily can it be implemented?
  
//   Format response exactly as JSON:
//     "relevance": number,
//     "impact": number,
//     "feasibility": number,
//     "explanation": "brief explanation of scores"`;

//   const response = await axios({
//     url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
//     method: "post",
//     data: {
//       contents: [{ parts: [{ text: prompt }] }],
//     },
//   });

//   const result = response.data.candidates[0].content.parts[0].text;
//   return JSON.parse(result);
// }

// // Generate options endpoint with priority ranking
// app.post('/api/generate-options', async (req, res) => {
//   try {
//     const { query } = req.body;
//     const prompt = `Based on this query: "${query}", generate exactly 3 unique and creative numbered options. Format them exactly like this:
//     1. First option
//     2. Second option
//     3. Third option`;

//     const response = await axios({
//       url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
//       method: "post",
//       data: {
//         contents: [{ parts: [{ text: prompt }] }],
//       },
//     });

//     const options = response.data.candidates[0].content.parts[0].text
//       .split('\n')
//       .filter(opt => opt.trim())
//       .map(opt => opt.replace(/^\d+\.\s*/, '').trim());

//     // Analyze and rank each option
//     const rankedOptions = await Promise.all(
//       options.map(async (option) => {
//         const analysis = await analyzeOptionPriority(query, option);
//         const averageScore = (analysis.relevance + analysis.impact + analysis.feasibility) / 3;
        
//         return {
//           option,
//           scores: {
//             relevance: analysis.relevance,
//             impact: analysis.impact,
//             feasibility: analysis.feasibility,
//             average: averageScore
//           },
//           explanation: analysis.explanation
//         };
//       })
//     );

//     // Sort by average score (remember 1 is best)
//     rankedOptions.sort((a, b) => a.scores.average - b.scores.average);

//     res.json({ rankedOptions });
//   } catch (error) {
//     console.error('Error generating options:', error);
//     res.status(500).json({ error: 'Failed to generate options' });
//   }
// });

// // Generate detailed response endpoint
// app.post('/api/generate-detailed-response', async (req, res) => {
//   try {
//     const { query, selectedOptions } = req.body;
//     const prompt = `For the following selected options from the query "${query}":

// ${selectedOptions.join("\n")}

// Provide detailed suggestions for each option. Format the response EXACTLY like this, including the exact spacing and markdown:

// **For [Selected Option 1]**
// • Add specific feature details here
// • Include target audience information
// • Provide implementation steps and marketing strategy

// **For [Selected Option 2]**
// • Add specific feature details here
// • Include target audience information
// • Provide implementation steps and marketing strategy

// Note: Replace the bullet points with real, detailed suggestions specific to each option. Each bullet point should be a complete sentence with actionable information. And each bullet points should start from a new line`;

//     const response = await axios({
//       url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
//       method: "post",
//       data: {
//         contents: [{ parts: [{ text: prompt }] }],
//       },
//     });

//     const result = response.data.candidates[0].content.parts[0].text;
//     const formattedResult = result.split('\n').map(line => {
//       if (line.startsWith('For ')) {
//         return `**${line}**`;
//       }
//       if (line.trim().startsWith('•')) {
//         return line;
//       }
//       if (line.trim().startsWith('-')) {
//         return line.replace('-', '•');
//       }
//       return line;
//     }).join('\n');

//     res.json({ response: formattedResult });
//   } catch (error) {
//     console.error('Error generating detailed response:', error);
//     res.status(500).json({ error: 'Failed to generate detailed response' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
