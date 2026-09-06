"use strict";
/**
 * ==============================================================================
 * @instagrambot/types — Shared Domain Types & Contracts
 * ==============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEventType = exports.AutomationActionType = exports.AutomationConditionOperator = exports.AutomationTriggerType = exports.AIProviderType = exports.MessageMediaType = exports.MessageStatus = exports.MessageSender = exports.MessageDirection = exports.ConversationStatus = exports.InstagramAccountStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["AGENT"] = "AGENT";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var InstagramAccountStatus;
(function (InstagramAccountStatus) {
    InstagramAccountStatus["CONNECTING"] = "CONNECTING";
    InstagramAccountStatus["CONNECTED"] = "CONNECTED";
    InstagramAccountStatus["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    InstagramAccountStatus["TOKEN_REVOKED"] = "TOKEN_REVOKED";
    InstagramAccountStatus["PERMISSION_ERROR"] = "PERMISSION_ERROR";
    InstagramAccountStatus["WEBHOOK_ERROR"] = "WEBHOOK_ERROR";
    InstagramAccountStatus["DISCONNECTED"] = "DISCONNECTED";
    InstagramAccountStatus["ERROR"] = "ERROR";
})(InstagramAccountStatus || (exports.InstagramAccountStatus = InstagramAccountStatus = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["OPEN"] = "OPEN";
    ConversationStatus["PENDING"] = "PENDING";
    ConversationStatus["RESOLVED"] = "RESOLVED";
    ConversationStatus["SPAM"] = "SPAM";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["INBOUND"] = "INBOUND";
    MessageDirection["OUTBOUND"] = "OUTBOUND";
})(MessageDirection || (exports.MessageDirection = MessageDirection = {}));
var MessageSender;
(function (MessageSender) {
    MessageSender["CUSTOMER"] = "CUSTOMER";
    MessageSender["AI"] = "AI";
    MessageSender["AGENT"] = "AGENT";
    MessageSender["SYSTEM"] = "SYSTEM";
})(MessageSender || (exports.MessageSender = MessageSender = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["QUEUED"] = "QUEUED";
    MessageStatus["SENDING"] = "SENDING";
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["FAILED"] = "FAILED";
    MessageStatus["READ"] = "READ";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
var MessageMediaType;
(function (MessageMediaType) {
    MessageMediaType["TEXT"] = "text";
    MessageMediaType["IMAGE"] = "image";
    MessageMediaType["VIDEO"] = "video";
    MessageMediaType["AUDIO"] = "audio";
    MessageMediaType["FILE"] = "file";
})(MessageMediaType || (exports.MessageMediaType = MessageMediaType = {}));
var AIProviderType;
(function (AIProviderType) {
    AIProviderType["GEMINI"] = "gemini";
    AIProviderType["OPENAI"] = "openai";
    AIProviderType["GEMINI_LIVE"] = "gemini_live";
})(AIProviderType || (exports.AIProviderType = AIProviderType = {}));
var AutomationTriggerType;
(function (AutomationTriggerType) {
    AutomationTriggerType["MESSAGE_RECEIVED"] = "MESSAGE_RECEIVED";
    AutomationTriggerType["FIRST_MESSAGE"] = "FIRST_MESSAGE";
    AutomationTriggerType["KEYWORD"] = "KEYWORD";
    AutomationTriggerType["CONVERSATION_OPENED"] = "CONVERSATION_OPENED";
    AutomationTriggerType["TAG_ADDED"] = "TAG_ADDED";
    AutomationTriggerType["BUSINESS_HOURS"] = "BUSINESS_HOURS";
    AutomationTriggerType["TIME_DELAY"] = "TIME_DELAY";
})(AutomationTriggerType || (exports.AutomationTriggerType = AutomationTriggerType = {}));
var AutomationConditionOperator;
(function (AutomationConditionOperator) {
    AutomationConditionOperator["CONTAINS"] = "contains";
    AutomationConditionOperator["NOT_CONTAINS"] = "not_contains";
    AutomationConditionOperator["EQUALS"] = "equals";
    AutomationConditionOperator["REGEX"] = "regex";
    AutomationConditionOperator["TAG_EXISTS"] = "tag_exists";
    AutomationConditionOperator["BUSINESS_HOURS"] = "business_hours";
    AutomationConditionOperator["CONVERSATION_STATUS"] = "conversation_status";
    AutomationConditionOperator["AI_ENABLED"] = "ai_enabled";
})(AutomationConditionOperator || (exports.AutomationConditionOperator = AutomationConditionOperator = {}));
var AutomationActionType;
(function (AutomationActionType) {
    AutomationActionType["SEND_MESSAGE"] = "SEND_MESSAGE";
    AutomationActionType["SEND_AI_RESPONSE"] = "SEND_AI_RESPONSE";
    AutomationActionType["ADD_TAG"] = "ADD_TAG";
    AutomationActionType["REMOVE_TAG"] = "REMOVE_TAG";
    AutomationActionType["ASSIGN_AGENT"] = "ASSIGN_AGENT";
    AutomationActionType["ASSIGN_TEAM"] = "ASSIGN_TEAM";
    AutomationActionType["MARK_RESOLVED"] = "MARK_RESOLVED";
    AutomationActionType["ENABLE_AI"] = "ENABLE_AI";
    AutomationActionType["DISABLE_AI"] = "DISABLE_AI";
    AutomationActionType["WAIT"] = "WAIT";
    AutomationActionType["WEBHOOK"] = "WEBHOOK";
    AutomationActionType["CREATE_NOTE"] = "CREATE_NOTE";
})(AutomationActionType || (exports.AutomationActionType = AutomationActionType = {}));
var WebSocketEventType;
(function (WebSocketEventType) {
    WebSocketEventType["MESSAGE_CREATED"] = "message.created";
    WebSocketEventType["MESSAGE_UPDATED"] = "message.updated";
    WebSocketEventType["CONVERSATION_UPDATED"] = "conversation.updated";
    WebSocketEventType["CONVERSATION_UNREAD_CHANGE"] = "conversation.unread_change";
    WebSocketEventType["TYPING_INDICATOR"] = "agent.typing";
    WebSocketEventType["AI_STATUS_CHANGE"] = "ai.status_change";
    WebSocketEventType["NOTIFICATION"] = "notification.new";
})(WebSocketEventType || (exports.WebSocketEventType = WebSocketEventType = {}));
