import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.0-pro"
    });

    const result = await model.generateContent("Say hello in JSON");
    console.log(result.response.text());

  } catch (err) {
    console.error("GEMINI TEST ERROR:", err);
  }
}

test();