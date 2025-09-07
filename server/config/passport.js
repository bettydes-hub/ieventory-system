const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { fetchBasecampProfile } = require('../services/basecampService');

// Session serializer not required (we use JWT), but define no-ops to be safe
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

// Local strategy: only allow @ienetworks.co emails
passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false },
  async (email, password, done) => {
    try {
      const normalized = (email || '').toLowerCase();
      if (!normalized.endsWith('@ienetworks.co')) {
        return done(null, false, { message: 'Email must be @ienetworks.co' });
      }

      const user = await User.findOne({ where: { email: normalized } });
      if (!user) return done(null, false, { message: 'Invalid email or password' });
      if (user.isActive === false) return done(null, false, { message: 'Account is deactivated' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return done(null, false, { message: 'Invalid email or password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Basecamp OAuth2 strategy
passport.use('basecamp', new OAuth2Strategy({
  authorizationURL: process.env.BASECAMP_AUTH_URL,
  tokenURL: process.env.BASECAMP_TOKEN_URL,
  clientID: process.env.BASECAMP_CLIENT_ID,
  clientSecret: process.env.BASECAMP_CLIENT_SECRET,
  callbackURL: process.env.BASECAMP_CALLBACK_URL,
  scope: process.env.BASECAMP_SCOPE ? process.env.BASECAMP_SCOPE.split(',') : undefined,
  state: true
}, async (accessToken, refreshToken, params, profile, done) => {
  try {
    // Fetch profile from Basecamp API if URL provided
    let bcProfile = null;
    if (process.env.BASECAMP_PROFILE_URL) {
      bcProfile = await fetchBasecampProfile(process.env.BASECAMP_PROFILE_URL, accessToken);
    }

    // Derive email/name
    const email = bcProfile?.email?.toLowerCase?.() || bcProfile?.identity?.email?.toLowerCase?.();
    const name = bcProfile?.name || [bcProfile?.first_name, bcProfile?.last_name].filter(Boolean).join(' ') || 'Basecamp User';

    if (!email) {
      return done(null, false, { message: 'Unable to retrieve email from Basecamp profile' });
    }

    // Find or create user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      user = await User.create({
        name,
        email,
        password_hash: randomPassword, // will be hashed by model hook
        role: 'Employee',
        isActive: true
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;

