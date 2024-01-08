import { Profile } from "@/contexts/Web5Context";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { Follower, Following, Post, SharedProfile } from "@/lib/types";
import { Web5 } from "@web5/api";

const dwnService = (web5: Web5) => {
  const getFollowing = async (did: string): Promise<Following[] | null> => {
    const { records: followingRecords } = await web5.dwn.records.query({
      message: {
        filter: {
          author: did,
          protocol: protocolDefinition.protocol,
          protocolPath: "following",
          schema: schemas.following,
        },
      },
    });

    if (followingRecords) {
      const following = await Promise.all<Following>(
        followingRecords.map(
          (record) =>
            new Promise(async (resolve) =>
              resolve({
                ...(await record.data.json()),
                recordId: record.id,
              })
            )
        )
      );
      return following;
    }
    return null;
  };

  const getFollowers = async (did: string): Promise<Follower[] | null> => {
    const { records: followerRecords } = await web5.dwn.records.query({
      from: did,
      message: {
        filter: {
          recipient: did,
          protocol: protocolDefinition.protocol,
          protocolPath: "following",
          schema: schemas.following,
        },
      },
    });

    if (followerRecords) {
      const followers: Follower[] = await Promise.all<Follower>(
        followerRecords.map((record) => {
          return new Promise(async (resolve) => {
            const { records: sharedProfileRecords } =
              await web5.dwn.records.query({
                from: did,
                message: {
                  filter: {
                    recipient: did,
                    parentId: record.id,
                    protocol: protocolDefinition.protocol,
                    protocolPath: "following/sharedProfile",
                    schema: schemas.sharedProfile,
                  },
                },
              });
            if (sharedProfileRecords?.length) {
              const sharedProfile: SharedProfile = {
                ...(await sharedProfileRecords[0].data.json()),
                recordId: sharedProfileRecords[0].id,
              };
              resolve({ did: record.author, sharedProfile });
            } else {
              resolve({ did: record.author });
            }
          });
        })
      );
      return followers;
    }
    return null;
  };

  const unfollow = async (followingId: string, followeeDid: string) => {
    const localDeleteRes = await web5.dwn.records.delete({
      message: {
        recordId: followingId,
      },
    });

    const remoteDeleteRes = await web5.dwn.records.delete({
      from: followeeDid,
      message: {
        recordId: followingId,
      },
    });

    console.log({ remoteDeleteRes, localDeleteRes });
    const localSuccess =
      localDeleteRes.status.code >= 200 && localDeleteRes.status.code < 300;
    const remoteSuccess =
      remoteDeleteRes.status.code >= 200 && remoteDeleteRes.status.code < 300;
    if (localSuccess) {
      console.log("Local Delete success");
    }
    if (remoteSuccess) {
      console.log("Remote del success");
    }

    if (localSuccess && remoteSuccess) {
      return true;
    }
    return false;
  };

  const follow = async (
    followeeDid: string,
    assignedName: string,
    profile: Profile,
    sharedProfileAttributes: string[]
  ) => {
    const { record: followingRecord, status: createStatus } =
      await web5.dwn.records.create({
        data: {
          did: followeeDid,
          assignedName: assignedName,
        },
        message: {
          schema: schemas.following,
          dataFormat: "application/json",
          protocol: protocolDefinition.protocol,
          protocolPath: "following",
          recipient: followeeDid,
        },
      });

    if (!(createStatus.code >= 200 && createStatus.code < 400)) {
      return false;
    } else {
      if (followingRecord) {
        const { status: followSendStatus } = await followingRecord.send(
          followeeDid
        );

        console.log({ followSendStatus });

        const sharedProfile: { [key: string]: string } = {};
        for (const key in profile) {
          const safeKey = key as keyof Profile;
          if (sharedProfileAttributes.includes(safeKey)) {
            sharedProfile[safeKey] = profile[safeKey];
          }
        }

        const {
          record: sharedProfileRecord,
          status: createSharedProfileStatus,
        } = await web5.dwn.records.create({
          data: sharedProfile,
          message: {
            parentId: followingRecord.id,
            contextId: followingRecord.contextId,
            schema: schemas.sharedProfile,
            dataFormat: "application/json",
            protocol: protocolDefinition.protocol,
            protocolPath: "following/sharedProfile",
            recipient: followeeDid,
          },
        });
        console.log(createSharedProfileStatus);
        if (sharedProfileRecord) {
          const { status: sharedProfileStatus } =
            await sharedProfileRecord.send(followeeDid);
          console.log({ sharedProfileStatus });
          return true;
        }
      }
    }
    return false;
  };
  const getPosts = async (did: string) => {
    const { records: ownPostRecords } = await web5.dwn.records.query({
      message: {
        filter: {
          author: did,
          protocol: protocolDefinition.protocol,
          protocolPath: "post",
          schema: schemas.post,
        },
      },
    });

    const { records: sentPostRecords } = await web5.dwn.records.query({
      from: did,
      message: {
        filter: {
          recipient: did,
          protocol: protocolDefinition.protocol,
          protocolPath: "post",
          schema: schemas.post,
        },
      },
    });

    console.log({ sentPostRecords });

    if (ownPostRecords && sentPostRecords) {
      const posts = (await Promise.all(
        [...ownPostRecords, ...sentPostRecords].map(
          (record) =>
            new Promise<Post>(async (resolve) =>
              resolve({
                ...(await record.data.json()),
                recordId: record.id,
                authorId: record.author,
                authorLabel: "Anonymous",
                dateCreated: record.dateCreated,
              })
            )
        )
      )) as Post[];

      return posts;
    }
    return null;
  };
  return {
    getFollowing,
    getFollowers,
    unfollow,
    follow,
    getPosts,
  };
};

export default dwnService;
