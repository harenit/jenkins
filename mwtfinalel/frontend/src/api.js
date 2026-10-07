// Thin fetch wrapper around the PrepCycle backend.
// In dev, Vite proxies "/api" -> http://localhost:5000 (see vite.config.js).

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response - fall through
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}

function qs(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
}

export const api = {
  health: () => request("/health"),
  quotes: () => request("/quotes"),

  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  updateProfile: (token, payload) => request("/auth/profile", { method: "PUT", token, body: payload }),
  changePassword: (token, payload) => request("/auth/change-password", { method: "PUT", token, body: payload }),

  // exams
  listExams: (token, params) => request(`/exams${qs(params)}`, { token }),
  examCategories: () => request("/exams/categories"),
  getExam: (token, slug) => request(`/exams/${slug}`, { token }),
  registerExam: (token, slug) => request(`/exams/${slug}/register`, { method: "POST", token }),
  unregisterExam: (token, slug) => request(`/exams/${slug}/register`, { method: "DELETE", token }),

  // progress
  getRoadmap: (token, examSlug) => request(`/progress/${examSlug}`, { token }),
  getAllProgress: (token) => request(`/progress`, { token }),
  setTopicStatus: (token, examSlug, topicId, status) =>
    request(`/progress/${examSlug}/topic/${topicId}`, { method: "PATCH", token, body: { status } }),
  resetProgress: (token, examSlug, topicId) =>
    request(`/progress/${examSlug}/reset`, { method: "POST", token, body: { topicId } }),

  // deep mock-test analytics
  getChapterAttempts: (token, examSlug, chapterId) => request(`/mock-attempts/${examSlug}/chapter/${chapterId}`, { token }),
  recordMockAttempt: (token, examSlug, chapterId, payload) => request(`/mock-attempts/${examSlug}/chapter/${chapterId}`, { method: "POST", token, body: payload }),

  // quiz generation
  generateQuiz: (token, payload) => request(`/quizzes/generate`, { method: "POST", token, body: payload }),

  // recently accessed
  getRecentlyAccessed: (token) => request(`/recently-accessed`, { token }),
  recordRecentlyAccessed: (token, payload) => request(`/recently-accessed`, { method: "POST", token, body: payload }),

  // planner + analytics
  getTodaysPlan: (token, params) => request(`/planner${qs(params)}`, { token }),
  getAnalytics: (token) => request(`/analytics`, { token }),
  saveQuizAttempt: (token, payload) => request("/quizzes/attempt", { method: "POST", token, body: payload }),
  listQuizAttempts: (token, params) => request(`/quizzes/attempts${qs(params)}`, { token }),

  // flashcards
  listFlashcards: (token, params) => request(`/flashcards${qs(params)}`, { token }),
  createFlashcard: (token, payload) => request(`/flashcards`, { method: "POST", token, body: payload }),
  deleteFlashcard: (token, id) => request(`/flashcards/${id}`, { method: "DELETE", token }),
  generateFlashcards: (token, payload) => request(`/flashcards/generate`, { method: "POST", token, body: payload }),
  saveGeneratedFlashcards: (token, payload) => request(`/flashcards/generate/save`, { method: "POST", token, body: payload }),

  // notes
  listNotes: (token) => request(`/notes`, { token }),
  createNote: (token, payload) => request(`/notes`, { method: "POST", token, body: payload }),
  updateNote: (token, id, payload) => request(`/notes/${id}`, { method: "PATCH", token, body: payload }),
  deleteNote: (token, id) => request(`/notes/${id}`, { method: "DELETE", token }),

  // resources
  listResources: (token, params) => request(`/resources${qs(params)}`, { token }),
  shareResource: (token, payload) => request(`/resources`, { method: "POST", token, body: payload }),
  toggleBookmark: (token, id) => request(`/resources/${id}/bookmark`, { method: "POST", token }),

  // marketplace
  listProducts: (params) => request(`/marketplace/products${qs(params)}`),
  listDonatedProducts: (params) => request(`/marketplace/donations${qs(params)}`),
  claimDonatedProduct: (token, id, payload) => request(`/marketplace/donations/${id}/claim`, { method: "POST", token, body: payload }),
  listMyListings: (token) => request(`/marketplace/my-listings`, { token }),
  listMyDonations: (token) => request(`/marketplace/my-donations`, { token }),
  createListing: (token, payload) => request(`/marketplace/products`, { method: "POST", token, body: payload }),
  getCart: (token) => request(`/marketplace/cart`, { token }),
  addToCart: (token, productId, quantity = 1) => request(`/marketplace/cart`, { method: "POST", token, body: { productId, quantity } }),
  updateCartItem: (token, productId, quantity) => request(`/marketplace/cart/${productId}`, { method: "PATCH", token, body: { quantity } }),
  removeFromCart: (token, productId) => request(`/marketplace/cart/${productId}`, { method: "DELETE", token }),

  // orders
  checkout: (token, payload) => request(`/orders/checkout`, { method: "POST", token, body: payload }),
  listOrders: (token) => request(`/orders`, { token }),
  advanceOrder: (token, id) => request(`/orders/${id}/advance`, { method: "POST", token }),

  // returns / resale / donation
  createCommerceRequest: (token, payload) => request(`/commerce/requests`, { method: "POST", token, body: payload }),
  listCommerceRequests: (token) => request(`/commerce/requests`, { token }),
  listPeople: (token) => request(`/commerce/people`, { token }),
  getConversation: (token, userId) => request(`/commerce/messages/${userId}`, { token }),
  sendMessage: (token, userId, body) => request(`/commerce/messages/${userId}`, { method: "POST", token, body: { body } }),
  chat: (token, message) => request(`/chat`, { method: "POST", token, body: { message } }),
  deliveryOrders: (token) => request(`/delivery/orders`, { token }),
  deliveryReturns: (token) => request(`/delivery/returns`, { token }),
  deliveryUpdateReturn: (token, id, status, otp) => request(`/delivery/returns/${id}`, { method: "PATCH", token, body: { status, otp } }),
  deliverySetStatus: (token, id, status, otp) => request(`/delivery/orders/${id}/status`, { method: "PATCH", token, body: { status, otp } }),

  // notifications
  getNotifications: (token) => request(`/notifications`, { token }),
  markNotificationRead: (token, id) => request(`/notifications/${id}/read`, { method: "PATCH", token }),
  markAllNotificationsRead: (token) => request(`/notifications/mark-all-read`, { method: "POST", token }),

  // community
  listDiscussions: (params) => request(`/community${qs(params)}`),
  createDiscussion: (token, payload) => request(`/community`, { method: "POST", token, body: payload }),
  voteDiscussion: (token, id, direction) => request(`/community/${id}/vote`, { method: "POST", token, body: { direction } }),
  replyToDiscussion: (token, id, body) => request(`/community/${id}/reply`, { method: "POST", token, body: { body } }),
  markBestReply: (token, id, replyId) => request(`/community/${id}/reply/${replyId}/best`, { method: "POST", token }),

  // admin
  adminOverview: (token) => request(`/admin/overview`, { token }),
  adminListExams: (token) => request(`/admin/exams`, { token }),
  adminCreateExam: (token, payload) => request(`/admin/exams`, { method: "POST", token, body: payload }),
  adminUpdateExam: (token, slug, payload) => request(`/admin/exams/${slug}`, { method: "PATCH", token, body: payload }),
  adminDeleteExam: (token, slug) => request(`/admin/exams/${slug}`, { method: "DELETE", token }),
  adminListResources: (token) => request(`/admin/resources`, { token }),
  adminCreateResource: (token, payload) => request(`/admin/resources`, { method: "POST", token, body: payload }),
  adminDeleteResource: (token, id) => request(`/admin/resources/${id}`, { method: "DELETE", token }),
  adminListProducts: (token) => request(`/admin/products`, { token }),
  adminCreateProduct: (token, payload) => request(`/admin/products`, { method: "POST", token, body: payload }),
  adminDeleteProduct: (token, id) => request(`/admin/products/${id}`, { method: "DELETE", token }),
  adminListUsers: (token) => request(`/admin/users`, { token }),
  adminSetUserRole: (token, id, role) => request(`/admin/users/${id}/role`, { method: "PATCH", token, body: { role } }),
  adminDeleteUser: (token, id) => request(`/admin/users/${id}`, { method: "DELETE", token }),
  adminListOrders: (token) => request(`/admin/orders`, { token }),
  adminSetOrderStatus: (token, id, status) => request(`/admin/orders/${id}/status`, { method: "PATCH", token, body: { status } }),
  adminListReturns: (token) => request(`/admin/returns`, { token }),
  adminUpdateReturn: (token, id, status, notes) => request(`/admin/returns/${id}`, { method: "PATCH", token, body: { status, notes } }),
  adminListCommunications: (token, params) => request(`/communications/logs${qs(params)}`, { token }),
  adminTestCommunication: (token, payload) => request(`/communications/send`, { method: "POST", token, body: payload }),

  // mentor
  mentorGetStudents: (token) => request(`/mentor/students`, { token }),
  mentorGetProfile: (token) => request(`/mentor/profile`, { token }),
  mentorUpdateProfile: (token, payload) => request(`/mentor/profile`, { method: "PATCH", token, body: payload }),
  mentorSendMessage: (token, payload) => request(`/mentor/message`, { method: "POST", token, body: payload }),

  // admin mentor management
  adminListMentors: (token) => request(`/admin/mentors`, { token }),
  adminCreateMentor: (token, payload) => request(`/admin/mentors`, { method: "POST", token, body: payload }),
  adminAssignMentor: (token, payload) => request(`/admin/assign-mentor`, { method: "POST", token, body: payload }),
};

export default api;
