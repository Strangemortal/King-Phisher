async function checkPhishing() {
    const emailContent = document.getElementById("emailInput").value;
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "Analyzing...";
  
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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", // Replace with your OpenRouter API key
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a security AI. Analyze email content and respond with:
  - "Phishing" if clearly malicious
  - "Not Phishing" if clearly safe
  - "Phishing Likelihood: XX%" if unsure
  
  Only return ONE of these options.`
            },
            {
              role: "user",
              content: emailContent
            }
          ]
        })
      });
  
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
  
      if (reply) {
        resultDiv.textContent = `Result: ${reply}`;
      } else {
        resultDiv.textContent = "Error: No response from API.";
      }
    } catch (error) {
      console.error("Error:", error);
      resultDiv.textContent = "An error occurred while analyzing the email.";
    }
  }
  