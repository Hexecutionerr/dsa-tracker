export const transformSheetData = (rawData) => {
  if (!rawData || !rawData.data || !rawData.data.questions) return [];

  const hierarchy = {};

  rawData.data.questions.forEach((q) => {
    const topicName = q.topic || "Uncategorized";
    const subTopicName = q.subTopic || "General";

    if (!hierarchy[topicName]) {
      hierarchy[topicName] = {
        id: `topic-${topicName.replace(/\s+/g, '-')}`,
        title: topicName,
        subTopics: {},
        order: Object.keys(hierarchy).length, 
      };
    }

    if (!hierarchy[topicName].subTopics[subTopicName]) {
      hierarchy[topicName].subTopics[subTopicName] = {
        id: `sub-${subTopicName.replace(/\s+/g, '-')}`,
        title: subTopicName,
        questions: [],
      };
    }

    hierarchy[topicName].subTopics[subTopicName].questions.push({
      id: q.questionId?._id || `q-${Math.random().toString(36).substr(2, 9)}`,
      title: q.title || q.questionId?.name,
      difficulty: q.questionId?.difficulty || "Medium",
      url: q.questionId?.problemUrl || q.resource,
      platform: q.questionId?.platform || "custom",
      isSolved: false, 
    });
  });

  return Object.values(hierarchy).map(topic => ({
    ...topic,
    subTopics: Object.values(topic.subTopics)
  }));
};


