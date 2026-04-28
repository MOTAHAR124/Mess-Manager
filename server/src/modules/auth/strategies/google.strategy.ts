import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    const { id, displayName, emails, photos, name } = profile;

    const user = {
      id,
      displayName,
      emails,
      photos,
      email: emails?.[0]?.value,
      firstName: name?.givenName || displayName?.split(" ")[0] || "User",
      lastName: name?.familyName || displayName?.split(" ").slice(1).join(" "),
      profilePicture: photos?.[0]?.value,
      name,
      _json: profile._json,
    };

    done(null, user);
  }
}
