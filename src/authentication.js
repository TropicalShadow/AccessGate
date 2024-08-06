const bcrypt = require('bcrypt');
const PlatformManager = require('./Managers/AccountManager.js');
const LicensesManager = require('./Managers/UserLicenses.js');

class Authentication {
  constructor(request, response) {
    this.req = request;
    this.res = response;
  }


// Platform Authentication

  async login() {
    const { Username, Password } = this.req.body;

    try {
      // Find the user by username
      const userDB = new PlatformManager();
      const user = await userDB.getUserByUsername(Username);
      
      if (!user) {
        return this.Error("USER NOT FOUND");
      }

      // Compare the provided password with the hashed password stored in the user data
      const passwordMatch = await bcrypt.compare(Password, user.Password);

      if (!passwordMatch) {
        return this.Error("PASSWORD INCORRECT");
      }


      // Generate session token and session ID
      const sessionToken = await userDB.createSessionToken(Username);
      const sessionID = await userDB.createSessionID(Username);
      const instanceToken = await userDB.createInstanceToken(Username);
      const UUID = await userDB.getUUIDbyUsername(Username);

      const EchoStreams_PUID = await userDB.fetchType(Username, 'EchoStreams_PUID');
      const EchoStreams_UID = await userDB.fetchType(Username, 'EchoStreams_UID')

      // UserData
      const userData = await userDB.fetchUserData(UUID);

      //  Testing to see if we can send the cookies to the client
      const time = require('../../com.arkasphere/utilites/time.js');
      const days = new time();

      // Calculate expiration time for cookies
      const maxAge = days.days(30); // Assuming 30 days expiration

      // Cookies Directive

      // Main Arka Tokens
      this.res.cookie('Arka_InstanceToken', instanceToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      this.res.cookie('Arka_UUID', UUID, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      this.res.cookie('EchoStreams_UUID', UUID, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      // UUID

      this.res.cookie('ArkaSphere_SessionToken', sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });

      this.res.cookie('ArkaSphere_SessionID', sessionID, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });

      // EchoStreams Player UID
      this.res.cookie('EchoStreams_PUID', EchoStreams_PUID, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });

      this.res.cookie('EchoStreams_UID', EchoStreams_UID, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });

        const urlEncodedString = JSON.stringify(userData);
        const decodedString = decodeURIComponent(urlEncodedString);
        const userDataDecode = JSON.parse(decodedString);

      // User Data Tag
      this.res.cookie('Arka_UDT', userDataDecode, {
        httpOnly: false,
        secure: false,
        maxAge,
        sameSite: 'strict'
      });

      // OLD
      // this.res.status(200).json({
      //     userData,
      // });

      this.res.status(200).redirect("/");

    } catch (error) {
      console.error('Error during login:', error);
      return this.res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
    }
  }

// Licensing

  async Userlicenses() {
    const { UUID, Secret } = this.req.body;
    try {
        const userDB = new LicensesManager();
        const user = await userDB.getUUID(UUID);

        if (!user) {
            this.logAction('User not found', 'ERROR', 'authentication');
            return this.Error("USER NOT FOUND");
        }

        const match = await bcrypt.compare(Secret, user.SecureKey);

        if (!match) {
            this.logAction('SecureKey incorrect for user: ' + UUID, 'ERROR', 'authentication');
            return this.Error("SecureKey INCORRECT");
        }
        return true;

    } catch (error) {
        console.error('Error during login:', error);
        this.logAction('Error during login: ' + error.message, 'ERROR', 'authentication');

        if (!this.res.headersSent) {
            return this.res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    }
}

  info(message) {
    console.info("[Net.HetMasterTje] " + message);
  }

  Error(message) {
    console.erro
    return this.res.status(401).json({ status: 'FAILED', reason: message });
  }
}

module.exports = Authentication;
