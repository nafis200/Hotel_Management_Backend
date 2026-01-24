import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { openai } from "../../helper/open-router";
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage";

const getAISuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "symptoms is required!");
  }

  const doctors = [
    {
      id: "doc_1",
      name: "Dr. Rahman",
      specialties: ["Cardiology"],
      experienceYears: 12,
      hospital: "National Heart Foundation",
      isAvailable: true,
    },
    {
      id: "doc_2",
      name: "Dr. Sultana",
      specialties: ["Pulmonology"],
      experienceYears: 8,
      hospital: "Square Hospital",
      isAvailable: true,
    },
    {
      id: "doc_3",
      name: "Dr. Ahmed",
      specialties: ["Internal Medicine"],
      experienceYears: 15,
      hospital: "Apollo Hospital",
      isAvailable: false,
    },
    {
      id: "doc_4",
      name: "Dr. Khan",
      specialties: ["Dermatology"],
      experienceYears: 10,
      hospital: "Popular Diagnostic Center",
      isAvailable: true,
    },
  ];

  console.log("doctors data loaded.......\n");
  const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

  console.log("analyzing......\n");
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

  console.log(completion.choices[0].message)

  const result = await extractJsonFromMessage(completion.choices[0].message);
  return result;
};

export const DoctorService = {
  getAISuggestions,
};
