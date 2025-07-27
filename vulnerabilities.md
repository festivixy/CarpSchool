# MongoDB Security Vulnerabilities Analysis

## 🔍 **Analysis Summary**
This report analyzes the MongoDB usage in the Meteor carpool application for potential security vulnerabilities, focusing on NoSQL injection, authorization flaws, and data validation issues.

## ⚠️ **CRITICAL VULNERABILITIES**

### <a name="v001"></a>🚨 **V001: Missing Server-Side Validation in User Updates**
**File**: `imports/api/accounts/AccountsMethods.js:61-110`
**Severity**: HIGH
**Type**: Authorization & Data Validation

```javascript
// VULNERABLE: Direct database updates without proper validation
await Meteor.users.updateAsync(userId, {
  $set: {
    username: updateData.username,
    "emails.0.address": updateData.email,
    "emails.0.verified": updateData.emailVerified,
  },
});
```

**Issues**:
- No validation of email format on server side
- Admin can set any user as email verified without proper checks
- Username uniqueness not enforced
- Direct modification of email verification status bypasses Meteor's built-in verification

**Impact**: Admin privilege escalation, email spoofing, account takeover

---

### <a name="v002"></a>🚨 **V002: Race Condition in Share Code Generation**
**File**: `imports/api/ride/RideMethods.js:88-108` & `imports/api/chat/ChatMethods.js:72-76`
**Severity**: MEDIUM
**Type**: Race Condition

```javascript
// VULNERABLE: Race condition in share code generation
do {
  shareCode = generateCode();
  // eslint-disable-next-line no-await-in-loop
  existingRide = await Rides.findOneAsync({ shareCode });
  if (!existingRide) break;
} while (attempts++ < 10);
```

**Issues**:
- Multiple concurrent requests can generate identical share codes
- No atomic operation ensures uniqueness
- Share code collisions possible under load

**Impact**: Share code collisions, unauthorized access to rides/chats

---

### <a name="v003"></a>🚨 ~~**V003: Client-Side Data Exposure via Publications**~~ (Legacy)
**File**: ~~`imports/ui/legacy/pages/ListRides.jsx:98`~~, ~~`imports/ui/legacy/pages/AdminUsers.jsx:233`~~
**Severity**: HIGH
**Type**: Information Disclosure

```javascript
// VULNERABLE: Publishes all data without filtering
return {
  rides: Rides.find({}).fetch(),  // Exposes ALL rides
  users: Meteor.users.find({}).fetch(),  // Exposes ALL users
};
```

**Issues**:
- All rides published to all users (should be filtered by user)
- All user data exposed to admin pages
- No pagination or data limiting

**Impact**: Privacy violation, data leakage, performance issues

---

### <a name="v007"></a>🚨 **V007: XSS Vulnerability in CAPTCHA Display**
**File**: Multiple files using `dangerouslySetInnerHTML`
**Severity**: HIGH
**Type**: Cross-Site Scripting (XSS)

```javascript
// VULNERABLE: Direct HTML injection without sanitization
<CaptchaDisplay
  dangerouslySetInnerHTML={{ __html: this.state.captchaSvg }}
/>
```

**Affected Files**:
- `imports/ui/mobile/pages/SignIn.jsx:209`
- `imports/ui/mobile/pages/Signup.jsx:204`
- `imports/ui/mobile/pages/ForgotPassword.jsx:195`
- `imports/ui/mobile/components/ImageUpload.jsx:253`
- Multiple other CAPTCHA components

**Issues**:
- CAPTCHA SVG content injected directly into DOM
- No HTML sanitization on server-generated SVG content
- Potential for malicious SVG injection if CAPTCHA generation is compromised
- React's `dangerouslySetInnerHTML` bypasses XSS protection

**Impact**: XSS attacks, script injection, session hijacking

---

### <a name="v008"></a>🚨 **V008: Insecure Publications Exposing All Data**
**File**: `imports/api/ride/RidePublications.js:5-8`
**Severity**: CRITICAL
**Type**: Data Exposure & Authorization Bypass

```javascript
// VULNERABLE: Publishes ALL rides to ANY authenticated user
Meteor.publish("Rides", function publish() {
  if (this.userId) {
    return Rides.find({}); // No filtering - exposes everything!
  }
});
```

**Issues**:
- All rides published to any authenticated user
- No filtering by user participation
- Violates privacy - users can see rides they're not part of
- Performance issue - unnecessary data transmission

**Impact**: Complete privacy violation, data leakage, GDPR violations

---

### <a name="v009"></a>🚨 **V009: Race Condition in User Role Assignment**
**File**: `imports/startup/server/FirstRun.js:37-40`
**Severity**: MEDIUM
**Type**: Race Condition & Privilege Escalation

```javascript
// VULNERABLE: Direct role assignment without atomic operation
await Meteor.users.updateAsync(userID, {
  $set: { roles: ["admin"] },
});
```

**Issues**:
- Role assignment not atomic with user creation
- Concurrent user creation could interfere with role assignment
- No validation of existing roles before overwriting

**Impact**: Privilege escalation, authorization bypass

---

## ⚠️ **MEDIUM SEVERITY VULNERABILITIES**

### <a name="v004"></a>🟡 **V004: Insufficient Input Sanitization**
**File**: `imports/api/ride/RideMethods.js:131-139`
**Severity**: MEDIUM
**Type**: Input Validation

```javascript
// POTENTIALLY VULNERABLE: Basic string manipulation without full sanitization
let normalizedCode = shareCode.toUpperCase().replace(/\s+/g, "");
```

**Issues**:
- Limited input sanitization on share codes
- No protection against special characters
- Could allow malformed codes to pass validation

**Impact**: Data corruption, unexpected behavior

---

### <a name="v005"></a>🟡 ~~**V005: Direct Database Queries in Client Code**~~ (Legacy)
**File**: ~~`imports/ui/legacy/pages/EditProfile.jsx:30-58`~~
**Severity**: MEDIUM
**Type**: Security Architecture

```javascript
// ~~VULNERABLE: Direct database operations in client code~~
// ~~const profileCheck = Profiles.findOne({ Owner: Meteor.userId() });~~
// ~~Profiles.insert(profileData);~~
// ~~Profiles.update(profileCheck._id, { $set: profileUpdate });~~
```

**Issues**:
- ~~Database operations performed directly in UI code~~
- ~~Bypasses server-side methods and validation~~
- ~~No consistent error handling or authorization checks~~

**Impact**: Data integrity issues, authorization bypass

---

### <a name="v006"></a>🟡 ~~**V006: Weak Authorization in Profile Updates**~~ (Legacy)
**File**: ~~`imports/ui/legacy/pages/EditProfile.jsx:30-60`~~
**Severity**: MEDIUM
**Type**: Authorization

```javascript
// ~~VULNERABLE: Only checks current user ID, no additional validation~~
// ~~const profileCheck = Profiles.findOne({ Owner: Meteor.userId() });~~
```

**Issues**:
- ~~No validation of profile ownership on server side~~
- ~~Relies solely on client-side user ID~~
- ~~No audit trail for profile changes~~

**Impact**: Profile tampering, unauthorized modifications

---

### <a name="v010"></a>🟡 **V010: Timing Attack in CAPTCHA Validation**
**File**: `imports/api/accounts/AccountsHandlers.js:8-30`
**Severity**: MEDIUM
**Type**: Timing Attack

```javascript
// VULNERABLE: Different execution paths reveal CAPTCHA validity
const captchaSolved = await isCaptchaSolved(captchaSessionId);
if (!captchaSolved) {
  throw new Meteor.Error("invalid-captcha", "CAPTCHA not solved");
}
```

**Issues**:
- Database lookup time varies between valid/invalid CAPTCHAs
- Timing differences could reveal CAPTCHA session validity
- No constant-time comparison

**Impact**: CAPTCHA bypass through timing analysis

---

### <a name="v011"></a>🟡 **V011: Insecure Place Resolution in FirstRun**
**File**: `imports/startup/server/FirstRun.js:152-178`
**Severity**: MEDIUM
**Type**: Logic Flaw

```javascript
// VULNERABLE: Falls back to text search without validation
if (!originPlace) {
  originPlace = await Places.findOneAsync({ text: rideData.origin });
  if (originPlace) {
    rideData.origin = originPlace._id; // Direct assignment without validation
  }
}
```

**Issues**:
- No validation that found place belongs to correct user
- Could resolve to wrong place with same name
- No access control on place resolution

**Impact**: Data integrity issues, incorrect ride destinations

---

### <a name="v012"></a>🟡 **V012: Unsafe JSON Processing in Web Worker**
**File**: `imports/ui/mobile/utils/AsyncTileLoader.js:30-35`
**Severity**: LOW
**Type**: Code Injection

```javascript
// POTENTIALLY VULNERABLE: Dynamic worker script creation
const workerScript = `
  self.onmessage = async function(e) {
    const { tileUrl, tileId } = e.data;
    // Worker processes untrusted URLs
  }`;
```

**Issues**:
- Web worker processes potentially untrusted tile URLs
- No URL validation before processing
- Dynamic script generation

**Impact**: Limited - tile loading manipulation

---

### <a name="v013"></a>🚨 **V013: Missing File Type Validation in Image Upload**
**File**: `imports/api/images/ImageMethods.js:95-103`
**Severity**: HIGH
**Type**: File Upload Security

```javascript
// VULNERABLE: Relying on client-provided MIME type only
const allowedTypes = [
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
];
if (!allowedTypes.includes(imageData.mimeType)) {
  throw new Meteor.Error("invalid-file-type", "Only image files are allowed");
}
```

**Issues**:
- Only validates client-provided MIME type, easily spoofed
- No server-side file signature validation
- Allows potentially malicious files disguised as images
- No file extension validation

**Impact**: Malicious file upload, potential RCE via disguised executables

---

### <a name="v014"></a>🚨 **V014: Direct Image Data Exposure via Server Routes**
**File**: `imports/startup/server/ServerRoutes.js:5-45`
**Severity**: HIGH
**Type**: Information Disclosure & Access Control

```javascript
// VULNERABLE: No access control on image serving endpoint
WebApp.connectHandlers.use("/image", async (req, res, _next) => {
  const uuid = req.url.substring(1);
  const image = await Images.findOneAsync({ uuid: uuid });
  // No authorization checks - anyone can access any image
  res.end(imageBuffer);
});
```

**Issues**:
- No authentication or authorization checks
- Any user can access any image by guessing/knowing UUID
- Exposes potentially private images publicly
- No rate limiting on image requests

**Impact**: Privacy violation, unauthorized access to images, potential DoS

---

### <a name="v015"></a>🟡 **V015: Captcha Brute Force Vulnerability**
**File**: `imports/api/captcha/CaptchaMethods.js:31-54`
**Severity**: MEDIUM
**Type**: Rate Limiting & Brute Force

```javascript
// VULNERABLE: No rate limiting on captcha verification attempts
async "captcha.verify"(sessionId, userInput) {
  // No attempt limiting or exponential backoff
  const isValid = session.text === userInput.trim();
  return isValid;
}
```

**Issues**:
- No rate limiting on verification attempts
- Allows unlimited guessing attempts per session
- No account lockout or IP-based throttling
- Session cleanup doesn't prevent brute force

**Impact**: CAPTCHA bypass through brute force attacks

---

### <a name="v016"></a>🚨 **V016: Server-Side Request Forgery (SSRF) in Proxy Endpoints**
**File**: `imports/startup/server/ServerRoutes.js:70-180`
**Severity**: HIGH
**Type**: Server-Side Request Forgery

```javascript
// VULNERABLE: Hardcoded internal hostnames expose internal network
const options = {
  hostname: "tileserver-gl",  // Internal hostname exposed
  hostname: "nominatim",      // Internal hostname exposed
  hostname: "osrm",          // Internal hostname exposed
  port: 8082,
  path: targetPath,  // User-controlled path forwarded directly
};
```

**Issues**:
- Exposes internal service hostnames and ports
- User-controlled paths forwarded without validation
- Could be used to map internal network topology
- No request validation or sanitization

**Impact**: Internal network reconnaissance, potential access to internal services

---

### <a name="v017"></a>🟡 **V017: Weak CAPTCHA Session Management**
**File**: `imports/api/captcha/Captcha.js:18-32`
**Severity**: MEDIUM
**Type**: Session Management

```javascript
// VULNERABLE: Non-atomic CAPTCHA session updates
async function useCaptcha(sessionId) {
  const session = await Captcha.findOneAsync({ _id: sessionId });
  await Captcha.updateAsync(session, {
    // Race condition possible between find and update
    used: true,
  });
}
```

**Issues**:
- Race condition between find and update operations
- CAPTCHA could be used multiple times simultaneously
- No atomic "use-once" guarantee
- Session reuse possible under concurrent access

**Impact**: CAPTCHA session reuse, bypassing single-use restrictions

---

### <a name="v018"></a>🟡 **V018: Missing Input Sanitization in Chat Messages**
**File**: `imports/api/chat/ChatMethods.js:289-330`
**Severity**: MEDIUM
**Type**: Cross-Site Scripting (XSS)

```javascript
// VULNERABLE: No content sanitization before storing/displaying
async "chats.sendMessage"(chatId, content) {
  const message = {
    Sender: currentUser.username,
    Content: content,  // Raw content stored without sanitization
    Timestamp: new Date(),
  };
  await Chats.updateAsync(chatId, { $push: { Messages: message } });
}
```

**Issues**:
- Chat message content not sanitized before storage
- No HTML/script tag filtering
- Stored XSS possible when messages are displayed
- No content length restrictions enforced

**Impact**: Stored XSS attacks via chat messages, script injection

---

### <a name="v019"></a>🚨 **V019: Ride Publication Exposes All Data to Any User** (DUPLICATE of V008)
**File**: `imports/api/ride/RidePublications.js:5-8`
**Severity**: CRITICAL
**Type**: Authorization Bypass & Information Disclosure

```javascript
// VULNERABLE: Publishes ALL rides to ANY authenticated user
Meteor.publish("Rides", function publish() {
  if (this.userId) {
    return Rides.find(); // No filtering - exposes everything!
  }
  return this.ready();
});
```

**Issues**:
- All rides published to any authenticated user without filtering
- Complete violation of data privacy - users can see all rides
- No authorization based on ride participation
- Exposes sensitive data (destinations, times, driver/rider info)

**Impact**: Complete privacy violation, GDPR compliance issues, data leakage

---

### <a name="v020"></a>🟡 **V020: Email-Based User Discovery in Chat Publications**
**File**: `imports/api/chat/ChatPublications.js:21-44`
**Severity**: MEDIUM
**Type**: Information Disclosure

```javascript
// VULNERABLE: Allows email-based user enumeration
Meteor.publish("chats.withEmail", async function(searchEmail) {
  const targetUser = await Meteor.users.findOneAsync({
    "emails.address": searchEmail.toLowerCase().trim()
  });

  if (targetUser && targetUser.username) {
    // Behavior reveals if email exists in system
    return Chats.find({
      Participants: { $all: [currentUser.username, targetUser.username] }
    });
  }
});
```

**Issues**:
- Allows enumeration of registered email addresses
- Different behavior reveals whether email exists in system
- No rate limiting on email lookups
- Privacy violation for user email discovery

**Impact**: User enumeration, privacy violation, reconnaissance for attacks

---

### <a name="v021"></a>🟡 **V021: Performance Issues in Places Publications**
**File**: `imports/api/places/PlacesPublications.js:8-35 & 81-114`
**Severity**: MEDIUM
**Type**: Performance & DoS

```javascript
// VULNERABLE: Inefficient database queries without proper indexing
const userRides = await Rides.find({
  $or: [{ driver: currentUser.username }, { riders: currentUser.username }],
}).fetchAsync();

// Multiple database queries per publication
userRides.forEach((ride) => {
  if (ride.origin) placeIds.add(ride.origin);
  if (ride.destination) placeIds.add(ride.destination);
});
```

**Issues**:
- Multiple database queries executed per publication
- No proper indexing strategy for complex queries
- Fetches all rides into memory before processing
- N+1 query pattern potential for large datasets

**Impact**: Performance degradation, potential DoS, scalability issues

---

## ✅ **GOOD SECURITY PRACTICES FOUND**

### 🟢 **Proper Input Validation**
- Most Meteor methods use `check()` for basic type validation
- Joi schemas defined for data structure validation
- String length limits enforced in schemas

### 🟢 **Authorization Checks**
- Admin role checks in sensitive operations
- User authentication required for most operations
- Ride ownership validation before modifications

### 🟢 **Parameterized Queries**
- All MongoDB queries use proper parameter binding
- No raw string concatenation in queries
- MongoDB operators used correctly (`$push`, `$pull`, `$set`)

---

## 🛡️ **SECURITY RECOMMENDATIONS**

### **Immediate Actions Required**

1. **Fix XSS in CAPTCHA Display (V007)** - CRITICAL:
   ```javascript
   // Use a safe SVG rendering library instead of dangerouslySetInnerHTML
   import DOMPurify from 'dompurify';

   // Sanitize SVG content before rendering
   const sanitizedSvg = DOMPurify.sanitize(this.state.captchaSvg, {
     USE_PROFILES: { svg: true, svgFilters: true }
   });
   ```

2. **Fix Rides Publication Security (V008)** - CRITICAL:
   ```javascript
   // Filter rides by user participation
   Meteor.publish("Rides", function publish() {
     if (this.userId) {
       const currentUser = Meteor.users.findOne(this.userId);
       return Rides.find({
         $or: [
           { driver: currentUser.username },
           { riders: currentUser.username }
         ]
       });
     }
   });
   ```

3. **Fix User Update Validation (V001)**:
   ```javascript
   // Add proper email validation
   if (!SimpleSchema.RegEx.Email.test(updateData.email)) {
     throw new Meteor.Error("invalid-email", "Invalid email format");
   }

   // Check username uniqueness
   const existingUser = await Meteor.users.findOneAsync({
     username: updateData.username,
     _id: { $ne: userId }
   });
   if (existingUser) {
     throw new Meteor.Error("username-taken", "Username already exists");
   }
   ```

2. **Implement Atomic Share Code Generation**:
   ```javascript
   // Use MongoDB's findOneAndUpdate with upsert for atomicity
   const result = await Rides.rawCollection().findOneAndUpdate(
     { _id: rideId, shareCode: { $exists: false } },
     { $set: { shareCode: generateCode() } },
     { returnDocument: 'after' }
   );
   ```

3. **Fix Data Publication Security**:
   ```javascript
   // Filter publications properly
   return Rides.find({
     $or: [
       { driver: currentUser.username },
       { riders: currentUser.username }
     ]
   });
   ```

4. **Move Database Operations to Server Methods**:
   - Remove all direct database calls from client code
   - Implement proper server-side methods with authorization
   - Add comprehensive input validation

5. **Fix Image Upload Security (V013)** - CRITICAL:
   ```javascript
   // Add server-side file type validation
   const fileType = await FileType.fromBuffer(originalBinaryData);
   if (!fileType || !['jpg', 'png', 'gif', 'webp'].includes(fileType.ext)) {
     throw new Meteor.Error("invalid-file-type", "Invalid file type");
   }
   ```

6. **Fix Image Access Control (V014)** - CRITICAL:
   ```javascript
   // Add authentication to image serving endpoint
   if (!req.headers.authorization) {
     res.writeHead(401, { "Content-Type": "text/plain" });
     res.end("Unauthorized");
     return;
   }
   ```

7. **Fix Chat Message Sanitization (V018)**:
   ```javascript
   // Sanitize chat content before storage
   import DOMPurify from 'dompurify';
   const sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
   ```

8. **Implement CAPTCHA Rate Limiting (V015)**:
   ```javascript
   // Add rate limiting per IP/session
   const attempts = await Captcha.countDocuments({
     sessionId,
     timestamp: { $gt: Date.now() - 60000 }
   });
   if (attempts > 5) {
     throw new Meteor.Error("rate-limited", "Too many attempts");
   }
   ```

9. **Prevent User Enumeration in Chat (V020)**:
    ```javascript
    // Use constant-time lookup and don't reveal email existence
    // Consider implementing proper user search with privacy controls
    ```

### **Architecture Improvements**

1. **Implement Rate Limiting**: Add rate limiting to sensitive operations
2. **Add Audit Logging**: Log all administrative actions
3. **Enhance Authorization**: Implement role-based access control (RBAC)
4. **Add Data Encryption**: Encrypt sensitive data at rest
5. **Implement CSRF Protection**: Add CSRF tokens to sensitive operations

---

## 📊 **Risk Assessment**

| Vulnerability | Severity | Likelihood | Impact | Priority |
|--------------|----------|------------|---------|----------|
| [V001: User Update Validation](#v001) | HIGH | Medium | High | **CRITICAL** |
| [V002: Share Code Race Condition](#v002) | MEDIUM | Low | Medium | **HIGH** |
| [~~V003: Data Exposure (Client Publications)~~ (Legacy)](#v003) | HIGH | High | Medium | **CRITICAL** |
| [V004: Input Sanitization](#v004) | MEDIUM | Medium | Low | **MEDIUM** |
| [~~V005: Client DB Operations~~ (Legacy)](#v005) | MEDIUM | High | Medium | **HIGH** |
| [~~V006: Profile Authorization~~ (Legacy)](#v006) | MEDIUM | Medium | Medium | **MEDIUM** |
| [V007: XSS in CAPTCHA Display](#v007) | **HIGH** | Medium | High | **CRITICAL** |
| [V008: Rides Publication Exposure](#v008) | **CRITICAL** | High | High | **CRITICAL** |
| [V009: Role Assignment Race Condition](#v009) | MEDIUM | Low | High | **HIGH** |
| [V010: CAPTCHA Timing Attack](#v010) | MEDIUM | Low | Low | **LOW** |
| [V011: Insecure Place Resolution](#v011) | MEDIUM | Medium | Medium | **MEDIUM** |
| [V012: Web Worker JSON Processing](#v012) | LOW | Low | Low | **LOW** |
| [V013: Missing File Type Validation](#v013) | **HIGH** | High | High | **CRITICAL** |
| [V014: Direct Image Data Exposure](#v014) | **HIGH** | High | Medium | **CRITICAL** |
| [V015: Captcha Brute Force](#v015) | MEDIUM | Medium | Medium | **MEDIUM** |
| [V016: SSRF in Proxy Endpoints](#v016) | **HIGH** | Low | High | **HIGH** |
| [V017: Weak CAPTCHA Session Management](#v017) | MEDIUM | Medium | Medium | **MEDIUM** |
| [V018: Missing Chat Input Sanitization](#v018) | MEDIUM | High | Medium | **HIGH** |
| [V020: Email-Based User Discovery](#v020) | MEDIUM | Medium | Low | **MEDIUM** |
| [V021: Performance Issues in Publications](#v021) | MEDIUM | Medium | Medium | **MEDIUM** |

**Overall Risk Level**: **CRITICAL** - Multiple high-severity vulnerabilities require immediate remediation.
