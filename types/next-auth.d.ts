import "next-auth";

declare module "next-auth" {

    interface User {
        id: string;
        email: string;
        name: string;
        image?: string;
        accessToken?: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            accessToken?: string;
        },
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
    }
}