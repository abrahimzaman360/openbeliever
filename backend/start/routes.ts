import router from '@adonisjs/core/services/router';
import { middleware } from './kernel.js';
import { throttle } from './limiter.js';

// Import Controllers (Fixed Dynamic Imports)
const loadController = async (path: string) => (await import(path)).default;

const PostsController = await loadController('#controllers/posts_controller');
const RecommendationEnginesController = await loadController('#controllers/recommendation_engines_controller');
const UsersController = await loadController('#controllers/users_controller');
const HealthChecksController = await loadController('#controllers/health_checks_controller');
const AccountsController = await loadController('#controllers/accounts_controller');
const AuthController = await loadController('#controllers/authentication_controller');
const SearchController = await loadController('#controllers/search_controller');
const FollowerController = await loadController('#controllers/follow_system_controller');
const DiaryController = await loadController('#controllers/diary_controller');
const NotificationsController = await loadController('#controllers/notifications_controller');
const WsChatController = await loadController('#controllers/ws/chat_controller');
const DiskController = await loadController('#controllers/disk_controller');
const ConversationController = await loadController('#controllers/conversation_controller');

// Guest App Routes:
router.group(() => {
  router.post('/sign-up', [AuthController, 'register']);
  router.post('/sign-in', [AuthController, 'login']);
  router.post('/logout', [AuthController, 'logout']);
}).prefix('/api/auth');

// Authenticated Routes
router.group(() => {
  // User Profile
  router.group(() => {
    router.get('/me', [AccountsController, 'me']);
    router.post('/username-availability', [AccountsController, 'username_availability']);
    router.post('/upload-avatar', [AccountsController, 'upload_avatar']);
    router.put('/update-account', [AccountsController, 'update_account']);
    router.post('/upload-cover', [AccountsController, 'upload_cover']);
    router.delete('/remove-avatar', [AccountsController, 'remove_avatar']);
    router.get('/verify', [AuthController, 'verify']);
  }).prefix('/api/account');

  // Search Users
  router.group(() => {
    router.get('/search', [SearchController, 'searchUsers']);
    router.get('/:username', [UsersController, 'show']);
  }).prefix('/api/users');

  // Posts
  router.group(() => {
    router.get('/', [PostsController, 'feed']);
    router.post('/create', [PostsController, 'store']);
    router.get('/:id', [PostsController, 'show']);
    router.put('/:id', [PostsController, 'update']);
    router.delete('/:id', [PostsController, 'destroy']);
  }).prefix('/api/post-machine/posts');

  // Follow System
  router.group(() => {
    router.post('/follow', [FollowerController, 'follow']);
    router.post('/unfollow', [FollowerController, 'unfollow']);
    router.post('/private/request', [FollowerController, 'sendRequest']);
    router.post('/private/accept', [FollowerController, 'acceptRequest']);
    router.post('/private/reject', [FollowerController, 'rejectRequest']);
    router.post('/private/cancel', [FollowerController, 'cancelRequest']);
    router.post('/remove', [FollowerController, 'removeFollower']);
  }).prefix('/api/follow-machine').use(throttle);

  // AI Recommendations
  router.group(() => {
    router.get('/follows', [RecommendationEnginesController, 'index']);
  }).prefix('/api/ai-engine/suggestions').use(throttle);

  // Diary
  router.group(() => {
    router.get('/diary', [DiaryController, 'index']);
    router.post('/diary', [DiaryController, 'store']);
    router.put('/diary/:id', [DiaryController, 'update']);
    router.delete('/diary/:id', [DiaryController, 'destroy']);
  }).prefix('/api/diary-engine');

  // Chat
  router.group(() => {
    router.post('/create', [ConversationController, 'storeP2P']);
    router.post('/send', [ConversationController, 'sendMessage']);
    router.get('/', [ConversationController, 'syncConversations']);
    router.get('/:conversationId/messages', [ConversationController, 'fetchMessages']);
    router.post('/upload-attachments', [ConversationController, 'uploadAttachment']);
    router.delete('/:id', [ConversationController, 'delete']);
  }).prefix('/api/chat-engine/conversations').use(throttle);

  // Notifications
  router.group(() => {
    router.get('/', [NotificationsController, 'index']);
  }).prefix('/api/notifications').use(throttle);

  // Media Download
  router.group(() => {
    router.get('/:filename', [DiskController, 'download']);
  }).prefix('/api/disk-engine/download').use(throttle);

  // Disk Storage
  router.group(() => {
    router.post('/upload', [DiskController, 'store']);
  }).prefix('/api/disk-engine').use(throttle);
}).use(middleware.auth({ guards: ['web'] })); // Wraps all routes under auth middleware

// Health Checks
router.group(() => {
  router.get('/handle', [HealthChecksController, 'handle']).use(middleware.auth({ guards: ['web'] }));
  router.get('/ping', [HealthChecksController, 'ping']);
}).prefix('/api/health-checks')

// WebSocket Chat
router.ws('/ws/user/:userId', [WsChatController, 'handle']);
