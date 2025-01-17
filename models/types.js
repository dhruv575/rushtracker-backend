const BROTHER_POSITIONS = {
    PRESIDENT: 'President',
    RUSH_CHAIR: 'Rush Chair',
    BROTHER: 'Brother'
  };
  
  const EVENT_TYPES = {
    INTERVIEW: 'Interview',
    COFFEE_CHAT: 'Coffee Chat',
    APPLICATION: 'Application',
    SOCIAL_EVENT: 'Social Event',
    INFO_SESSION: 'Information Session',
    OTHER: 'Other'
  };
  
  const RUSHEE_STATUS = {
    POTENTIAL: 'Potential',
    ACTIVE: 'Active',
    DROPPED: 'Dropped',
    REJECTED: 'Rejected',
  };
  
  const QUESTION_TYPES = {
    TEXT: 'text',
    RATING: 'rating',
    MULTIPLE_CHOICE: 'multipleChoice',
    CHECKBOX: 'checkbox',
    TEXTAREA: 'textarea',
    IMAGE: 'image'
  };
  
  module.exports = {
    BROTHER_POSITIONS,
    EVENT_TYPES,
    RUSHEE_STATUS,
    QUESTION_TYPES
  };