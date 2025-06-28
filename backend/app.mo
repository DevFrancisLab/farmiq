import LLM "mo:llm";

persistent actor FarmIQ {

  let systemPrompt : LLM.ChatMessage = {
    system = "You are FarmIQ, a smart farming assistant helping African farmers with agriculture-related advice only. " #
             "You ONLY respond to questions about crops, soil, weather, livestock, fertilizers, and local farming practices. " #
             "You DO NOT answer anything unrelated to agriculture like tech, entertainment, politics, or religion. " #
             "If a question is off-topic, politely decline and redirect the user to ask a farming-related question."
  };

  public func prompt(prompt : Text) : async Text {
    await LLM.prompt(#Llama3_1_8B, prompt);
  };

  public func chat(messages : [LLM.ChatMessage]) : async Text {
    let fullMessages = Array.append([systemPrompt], messages);

    let response = await LLM.chat(#Llama3_1_8B)
      .withMessages(fullMessages)
      .send();

    switch (response.message.content) {
      case (?text) text;
      case null "";
    };
  };
}

