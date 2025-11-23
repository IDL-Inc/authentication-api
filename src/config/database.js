const mongoose = require('mongoose');
const logger = console;

function buildMongoUriFromEnv() {
  const user = process.env.MONGO_USER || process.env.MONGO_USERNAME;
  const pass = process.env.MONGO_PASS || process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST || process.env.MONGO_HOSTNAME;
  const db = process.env.MONGO_DB || process.env.MONGODB_DB || '';
  const options = process.env.MONGO_OPTIONS || ''; // e.g. `?retryWrites=true&w=majority`

  if (!host) return null;

  if (user && pass) {
    // Make sure credentials are URL-encoded so characters like `@` don't break the URI
    const userEnc = encodeURIComponent(user);
    const passEnc = encodeURIComponent(pass);
    return `mongodb+srv://${userEnc}:${passEnc}@${host}/${db}${options}`;
  }

  // If no credentials provided assume the host is a full connection string host (SRV)
  return `mongodb+srv://${host}/${db}${options}`;
}

const connectDB = async (mongoUri) => {
  try {
    let uri = mongoUri || process.env.MONGODB_URI;

    if (!uri) {
      uri = buildMongoUriFromEnv();
    }

    if (!uri) {
      logger.error('MongoDB connection error: no MongoDB URI provided. Set `MONGODB_URI` or `MONGO_HOST`+credentials in environment.');
      process.exit(1);
    }

    // Basic sanity-check: avoid common user mistakes where the password contains unencoded '@'
    const afterScheme = uri.includes('://') ? uri.split('://')[1] : uri;
    const atCount = (afterScheme.match(/@/g) || []).length;
    if (atCount > 1) {
      logger.error('MongoDB connection error: malformed connection string. It looks like your username or password contains an `@`. URL-encode special characters in the credentials (e.g. replace `@` with `%40`).');
      logger.error('Provided URI (truncated):', `${uri.slice(0, 80)}...`);
      process.exit(1);
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.log('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  }
};

module.exports = connectDB;
