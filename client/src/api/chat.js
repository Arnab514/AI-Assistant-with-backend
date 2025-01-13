import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api"

export const generateOptions = async query => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-options`, {
      query
    })
    const options = response.data.options
      .split("\n")
      .filter(opt => opt.trim())
      .map((option, index) => {
        // Simulated scoring logic - this should be replaced with AI-based scoring
        const relevance = 5 - index // Simple scoring for demonstration
        const impact = Math.max(3, 5 - index)
        const feasibility = Math.min(5, 6 - index)
        const total = (relevance + impact + feasibility) / 3

        return {
          option,
          score: {
            relevance,
            impact,
            feasibility,
            total
          },
          explanation: `This option received a relevance score of ${relevance}/5 based on keyword matching, 
                       an impact score of ${impact}/5 based on potential ROI analysis, 
                       and a feasibility score of ${feasibility}/5 based on implementation complexity.`
        }
      })
      .sort((a, b) => b.score.total - a.score.total)

    return options
  } catch (error) {
    console.error("Error generating options:", error)
    throw new Error("Failed to generate options")
  }
}

export const generateDetailedResponse = async (query, selectedOptions) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate-detailed-response`,
      {
        query,
        selectedOptions
      }
    )
    return response.data.response
  } catch (error) {
    console.error("Error generating detailed response:", error)
    throw new Error("Failed to generate detailed response")
  }
}
