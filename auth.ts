/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"


export const authConfig= NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {

        debugger;

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        try {         
          const response = await fetch(`http://localhost:8000/auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            email: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok || response) {
            const tokenData = await response.json();
            
            // Get user data using the token
            const userResponse = await fetch(`http://localhost:8000/auth/me`, {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            });

            console.log('userResponse', userResponse);

            if (!userResponse.ok) {

              throw new Error('Failed to fetch user data');
            }
  
            const userData = await userResponse.json();

            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              accessToken: tokenData.access_token,
            };
          }
          return null;

        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",   
    newUser: "/sign-up",
    error: "/error",
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error(code, message)
    },
    warn(code, ...message) {
      console.warn(code, message)
    },
    debug(code, ...message) {
      console.debug(code, message)
    }
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = user.accessToken || account.access_token;
          
        // Add user ID to token if available
        token.id = user.id;
        token.email = user.email;

        try {
          await fetch(`http://localhost:8000/auth/verify-session`, {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`
            }
          });
        } catch (error) {
          console.error('Session verification error:', error);
          // Handle invalid session
          throw new Error('Invalid session');
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.accessToken = token.accessToken as string;
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('Sign in:', user, account, profile, email, credentials);

      if (account?.type === "oauth") {
        try {
          const response = await fetch(`http:/localhost:8000/auth/${account.provider}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              token: account.access_token,
            }),
          });
          
          if (!response.ok) {
            throw new Error(await response.text());
          }
  
          const data = await response.json();
          if (data.access_token) {
            user.accessToken = data.access_token;
            // Add any additional user data from backend
            if (data.user) {
              user.id = data.user.id;
            }
          }
          
          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          return false;
        }
      }
      return true;
    },
  }
})

export const { handlers, signIn, signOut, auth } = authConfig