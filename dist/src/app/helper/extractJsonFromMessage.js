"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJsonFromMessage = void 0;
const extractJsonFromMessage = (message) => {
    try {
        const content = (message === null || message === void 0 ? void 0 : message.content) || "";
        // 1. Try to extract JSON code block (```json ... ```)
        const jsonBlockMatch = content.match(/```json([\s\S]*?)```/);
        if (jsonBlockMatch) {
            const jsonText = jsonBlockMatch[1].trim();
            return JSON.parse(jsonText);
        }
        // 2. If no code block, try to directly parse JSON if response is plain JSON
        if (content.trim().startsWith("[") || content.trim().startsWith("{")) {
            return JSON.parse(content);
        }
        // 3. Try to find the first JSON-like substring (fallback)
        const jsonFallbackMatch = content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonFallbackMatch) {
            return JSON.parse(jsonFallbackMatch[1]);
        }
        // 4. If still no valid JSON found
        return [];
    }
    catch (error) {
        console.error("Error parsing AI response:", error);
        return [];
    }
};
exports.extractJsonFromMessage = extractJsonFromMessage;
