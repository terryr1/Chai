import ConvoModel from "../Models/ConvoModel";

async function create(question, category) {
  return ConvoModel.shared.create(question, category);
}

export default { create };
