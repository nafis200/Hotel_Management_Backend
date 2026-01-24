
<!-- openrouter.Ai -->
<!-- click keys -->
<!-- https://openrouter.ai/settings/keys -->
<!-- create Api -->

<!-- api keys -->

<!-- project secret keys -->

<!-- go to docs -->

<!-- npm install openai -->

<!-- npm install @openrouter/sdk -->

<!-- copy using the openAi sdk -->

<!-- import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-5.2',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  });

  console.log(completion.choices[0].message);
}

main(); -->

<!--  docter routes make -->

<!--  using the OpenAI SDK -->

<!-- copy this code -->

const completion = await openai.chat.completions.create({
    model: 'openai/gpt-5.2',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  });
  console.log(completion.choices[0].message);

  <!-- go openrouters model and search free -->

  <!-- copy this -->

  z-ai/glm-4.5-air:free

  prompt

  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

