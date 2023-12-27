import { ProtocolsConfigureRequest } from "@web5/api";

export const protocolPath =
  "http://ansellmaximilian.github.io/crypticheartsprotocol";

export const schemas = {
  profile: "http://ansellmaximilian.github.io/crypticheartsprotocol/profile",
  profileImage:
    "http://ansellmaximilian.github.io/crypticheartsprotocol/profileImage",
  message: "http://ansellmaximilian.github.io/crypticheartsprotocol/message",
  following:
    "http://ansellmaximilian.github.io/crypticheartsprotocol/following",
};

export const protocolDefinition: ProtocolsConfigureRequest["message"]["definition"] =
  {
    protocol: protocolPath,
    published: true,
    types: {
      profile: {
        schema: schemas.profile,
        dataFormats: ["application/json"],
      },
      profileImage: {
        schema: schemas.profileImage,

        dataFormats: ["image/jpeg"],
      },
      message: {
        schema: schemas.message,
        dataFormats: ["text/plain"],
      },
      following: {
        schema: schemas.following,
        dataFormats: ["text/plain"],
      },
    },
    structure: {
      profile: {
        $actions: [
          { who: "anyone", can: "write" },
          { who: "anyone", can: "read" },
        ],
        profileImage: {
          $actions: [
            {
              who: "author",
              of: "profile",
              can: "write",
            },
          ],
        },
        following: {
          $actions: [
            {
              who: "author",
              of: "profile",
              can: "write",
            },
            {
              who: "author",
              of: "profile",
              can: "read",
            },
          ],
        },
      },
    },
  };
