"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProtocolsConfigureRequest, Web5 } from "@web5/api";
import { useToast } from "@/components/ui/use-toast";

export interface Web5ContextData {
  currentDid: string | null;
  loading: boolean;
  setCurrentDid: (did: string | null) => void;
  web5: Web5 | null;
  setWeb5: (web5: Web5 | null) => void;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}

export const Web5Context = createContext<Web5ContextData>({
  currentDid: null,
  loading: true,
  setCurrentDid: () => {},
  web5: null,
  setWeb5: () => {},
  profile: null,
  setProfile: () => {},
});

export type Profile = {
  username: string;
  fullName: string;
  description: string;
  dateOfBirth: Date;
};

export const protocolDefinition: ProtocolsConfigureRequest["message"]["definition"] =
  {
    protocol: "http://ansellmaximilian.github.io/crypticheartsprotocol",
    published: true,
    types: {
      profile: {
        schema:
          "http://ansellmaximilian.github.io/crypticheartsprotocol/profile",
        dataFormats: ["application/json"],
      },
      profileImage: {
        schema:
          "http://ansellmaximilian.github.io/crypticheartsprotocol/profileImage",

        dataFormats: ["image/jpeg"],
      },
      match: {
        schema: "http://ansellmaximilian.github.io/crypticheartsprotocol/match",

        dataFormats: ["application/json"],
      },
      message: {
        schema:
          "http://ansellmaximilian.github.io/crypticheartsprotocol/message",

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
      },
      match: {
        $actions: [
          { who: "anyone", can: "write" },
          { who: "anyone", can: "read" },
        ],
        message: {
          $actions: [
            {
              who: "author",
              of: "match",
              can: "write",
            },
            {
              who: "recipient",
              of: "match",
              can: "write",
            },
          ],
        },
      },
    },
  };

export const Web5ContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentDid, setCurrentDid] = useState<string | null>(null);
  const [web5, setWeb5] = useState<Web5 | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | Profile>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { web5, did } = await Web5.connect();
      setCurrentDid(did);
      setWeb5(web5);

      try {
        const { protocol, status: localStatus } =
          await web5.dwn.protocols.configure({
            message: {
              definition: protocolDefinition,
            },
          });
        toast({
          title: localStatus.detail,
          description: "Protocol has been successfully installed locally",
        });
        if (protocol) {
          const { status: remoteStatus } = await protocol.send(did);
          toast({
            title: remoteStatus.detail,
            description: "Protocol has been successfully installed locally",
          });
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <Web5Context.Provider
      value={{
        currentDid,
        setCurrentDid,
        loading,
        web5,
        setWeb5,
        profile,
        setProfile,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};

export const useWeb5 = (): Web5ContextData => {
  const context = useContext(Web5Context);
  if (!context) {
    throw new Error("useWeb5 must be used within a Web5ContextProvider");
  }
  return context;
};
