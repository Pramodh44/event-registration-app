1. PowerShell Script Execution Restriction
  Error: Attempting to run npm run build failed with a SecurityError indicating that script execution is disabled on the host system.
  Debugging & Solution: Identified that Windows PowerShell execution policies blocked direct binary execution. Resolved this by routing the node calls explicitly via cmd.exe /c npm run build.
2. Case-Sensitive File Casing (Turbopack compile failures)
  Error: Module not found compilation failures when looking for ../../../models/Event inside route.ts.
  Debugging & Solution: On Windows, the filesystem is case-insensitive, but Next.js’ compiler (Turbopack) is strictly case-sensitive. The file on disk was named models/event.ts (lowercase e). We corrected the import paths in 
  route.ts and seed.ts to match the lowercase naming conventions.
3. Database Authentication Failures (MongoDB Atlas)
  Error: Seeding script threw MongoServerError: bad auth : authentication failed.
  Debugging & Solution: Inspected .env.local and saw the password was wrapped in angle brackets <BjxBtMJ8MdQp1HC6> (which is standard placeholder syntax from Atlas). Removed the angle brackets so the connection URI reads ...db_user:BjxBtMJ8MdQp1HC6... to resolve the authentication error.
4. Asynchronous Environment Variables Loader for Standalone Script
  Error: Running the seed script directly with node threw Error: Please define the MONGODB_URI environment variable because dotenv keys are not loaded outside next dev/build.
  Debugging & Solution: Programmatic node scripts don't read .env.local by default. Instead of introducing external dependencies, we utilized Next.js' built-in @next/env package inside 
  lib/run-seed.js to load environmental configurations before initializing compilation.
5. Relative Dynamic Route Path Resolution
  Error: Module resolution failures during production compilation on app/api/events/[id]/register/route.ts.
  Debugging & Solution: Re-calculated directory depth from the dynamic directories. Nested files like /api/events/[id]/register/route.ts require 5 relative parent directory steps (../../../../../) to reach the root /lib and /models folders rather than 4 steps.
