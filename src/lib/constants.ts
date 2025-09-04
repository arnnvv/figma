export const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export const shapeElements = [
  {
    icon: "/assets/rectangle.svg",
    name: "Rectangle",
    value: "rectangle",
  },
  {
    icon: "/assets/circle.svg",
    name: "Circle",
    value: "circle",
  },
  {
    icon: "/assets/triangle.svg",
    name: "Triangle",
    value: "triangle",
  },
  {
    icon: "/assets/line.svg",
    name: "Line",
    value: "line",
  },
  {
    icon: "/assets/image.svg",
    name: "Image",
    value: "image",
  },
  {
    icon: "/assets/freeform.svg",
    name: "Free Drawing",
    value: "freeform",
  },
];

export const navElements = [
  {
    icon: "/assets/select.svg",
    name: "Select",
    value: "select",
  },
  {
    icon: "/assets/rectangle.svg",
    name: "Rectangle",
    value: shapeElements,
  },
  {
    icon: "/assets/text.svg",
    value: "text",
    name: "Text",
  },
  {
    icon: "/assets/delete.svg",
    value: "delete",
    name: "Delete",
  },
  {
    icon: "/assets/reset.svg",
    value: "reset",
    name: "Reset",
  },
  {
    icon: "/assets/comments.svg",
    value: "comments",
    name: "Comments",
  },
];

export const defaultNavElement = {
  icon: "/assets/select.svg",
  name: "Select",
  value: "select",
};

export const directionOptions = [
  { label: "Bring to Front", value: "front", icon: "/assets/front.svg" },
  { label: "Send to Back", value: "back", icon: "/assets/back.svg" },
];

export const fontFamilyOptions = [
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Brush Script MT", label: "Brush Script MT" },
];

export const fontSizeOptions = [
  {
    value: "10",
    label: "10",
  },
  {
    value: "12",
    label: "12",
  },
  {
    value: "14",
    label: "14",
  },
  {
    value: "16",
    label: "16",
  },
  {
    value: "18",
    label: "18",
  },
  {
    value: "20",
    label: "20",
  },
  {
    value: "22",
    label: "22",
  },
  {
    value: "24",
    label: "24",
  },
  {
    value: "26",
    label: "26",
  },
  {
    value: "28",
    label: "28",
  },
  {
    value: "30",
    label: "30",
  },
  {
    value: "32",
    label: "32",
  },
  {
    value: "34",
    label: "34",
  },
  {
    value: "36",
    label: "36",
  },
];

export const fontWeightOptions = [
  {
    value: "400",
    label: "Normal",
  },
  {
    value: "500",
    label: "Semibold",
  },
  {
    value: "600",
    label: "Bold",
  },
];

export const alignmentOptions = [
  { value: "left", label: "Align Left", icon: "/assets/align-left.svg" },
  {
    value: "horizontalCenter",
    label: "Align Horizontal Center",
    icon: "/assets/align-horizontal-center.svg",
  },
  { value: "right", label: "Align Right", icon: "/assets/align-right.svg" },
  { value: "top", label: "Align Top", icon: "/assets/align-top.svg" },
  {
    value: "verticalCenter",
    label: "Align Vertical Center",
    icon: "/assets/align-vertical-center.svg",
  },
  { value: "bottom", label: "Align Bottom", icon: "/assets/align-bottom.svg" },
];

export const shortcuts = [
  {
    key: "1",
    name: "Chat",
    shortcut: "/",
  },
  {
    key: "2",
    name: "Undo",
    shortcut: "⌘ + Z",
  },
  {
    key: "3",
    name: "Redo",
    shortcut: "⌘ + Y",
  },
  {
    key: "4",
    name: "Reactions",
    shortcut: "E",
  },
];

export const SESSION_COOKIE_NAME = "session" as const;

export const OAUTH_COOKIE_MAX_AGE_SECONDS = 600 as const; // 60 * 10
export const SESSION_MAX_AGE_SECONDS = 2592000 as const; // 60 * 60 * 24 * 30
export const SESSION_REFRESH_THRESHOLD_SECONDS = 1296000 as const; // 60 * 60 * 24 * 15

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_oauth_state" as const;
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME =
  "google_code_verifier" as const;
export const GOOGLE_OAUTH_NONCE_COOKIE_NAME = "google_oauth_nonce" as const;
export const GOOGLE_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token" as const;
export const GOOGLE_ACCOUNTS_AUTH_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth" as const;
export const GOOGLE_OID_ENDPOINT =
  "https://accounts.google.com/.well-known/openid-configuration" as const;

export const GITHUB_OAUTH_STATE_COOKIE_NAME = "github_oauth_state" as const;
export const GITHUB_OAUTH_CODE_VERIFIER_COOKIE_NAME =
  "github_code_verifier" as const;
export const GITHUB_TOKEN_ENDPOINT =
  "https://github.com/login/oauth/access_token" as const;
export const GITHUB_USER_ENDPOINT = "https://api.github.com/user" as const;
export const GITHUB_USER_EMAILS_ENDPOINT =
  "https://api.github.com/user/emails" as const;
export const GITHUB_AUTHORIZE_ENDPOINT =
  "https://github.com/login/oauth/authorize" as const;

export const PROVIDER = {
  GOOGLE: "google",
  GITHUB: "github",
} as const;
