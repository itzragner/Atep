    // Import all models to ensure they're registered
import User from '@/models/User';
import Workshop from '@/models/Workshop';
import Attendance from '@/models/Attendance';
import Notification from '@/models/Notification';

// Export them for use
export { User, Workshop, Attendance, Notification };

// This ensures all models are registered with mongoose
export default { User, Workshop, Attendance, Notification };