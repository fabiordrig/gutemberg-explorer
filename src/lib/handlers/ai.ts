import openai from "@/lib/ai";

export class AIHandlers {
  async generateBookSummaryAndCharacters(
    title: string,
    contentSnippet: string,
  ): Promise<{ summary: string | null; characters: string | null }> {
    const prompt = `
    Identify the summary of the book "${title}" and the key characters based on this text: ${contentSnippet}.

    Answer always in this JSON format:
    {
      "summary": "The summary of the book",
      "characters": "Character 1, Character 2, Character 3"
    }
    `;

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
      });

      const content = aiResponse.choices[0]?.message?.content ?? "";

      const parsedContent = JSON.parse(content);
      return {
        summary: parsedContent.summary ?? null,
        characters: parsedContent.characters ?? null,
      };
    } catch (error) {
      console.error("Error generating AI content:", error);
      throw new Error("Failed to generate summary and characters.");
    }
  }
}
