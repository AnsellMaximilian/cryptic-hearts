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
  sharedProfile:
    "http://ansellmaximilian.github.io/crypticheartsprotocol/sharedProfile",
  post: "http://ansellmaximilian.github.io/crypticheartsprotocol/post",
  postComment:
    "http://ansellmaximilian.github.io/crypticheartsprotocol/postComment",
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
      following: {
        schema: schemas.following,
        dataFormats: ["application/json"],
      },
      sharedProfile: {
        schema: schemas.sharedProfile,
        dataFormats: ["application/json"],
      },
      post: {
        schema: schemas.post,
        dataFormats: ["application/json"],
      },
      postComment: {
        schema: schemas.postComment,
        dataFormats: ["text/plain"],
      },
      message: {
        schema: schemas.message,
        dataFormats: ["application/json"],
      },
    },
    structure: {
      profile: {
        $actions: [
          { who: "anyone", can: "write" },
          { who: "author", of: "profile", can: "read" },
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
      },
      following: {
        $actions: [
          {
            who: "anyone",
            can: "write",
          },
          {
            who: "anyone",
            can: "read",
          },
        ],
        sharedProfile: {
          $actions: [
            {
              who: "author",
              of: "following",
              can: "write",
            },
            {
              who: "author",
              of: "following",
              can: "read",
            },
            {
              who: "recipient",
              of: "following",
              can: "read",
            },
          ],
        },
      },
      post: {
        $actions: [
          {
            who: "anyone",
            can: "write",
          },
          {
            who: "recipient",
            of: "post",
            can: "read",
          },
          {
            who: "author",
            of: "post",
            can: "read",
          },
        ],
        postComment: {
          $actions: [
            {
              who: "author",
              of: "post",
              can: "write",
            },
            {
              who: "author",
              of: "post",
              can: "read",
            },
            {
              who: "recipient",
              of: "post",
              can: "write",
            },
            {
              who: "recipient",
              of: "post",
              can: "read",
            },
          ],
        },
      },
      message: {
        $actions: [
          {
            who: "anyone",
            can: "write",
          },
          {
            who: "recipient",
            of: "message",
            can: "read",
          },
          {
            who: "author",
            of: "message",
            can: "read",
          },
        ],
      },
    },
  };
