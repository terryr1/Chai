import ConvoModel from "../Models/ConvoModel";

async function create(question, uid) {
  const pending_convo = await ConvoModel.shared.create(question, uid);

  return pending_convo;
}

export default { create };
