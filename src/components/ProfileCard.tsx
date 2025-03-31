"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import Button from "./Button";

type Member = {
  id: string;
  userId: string | null;
  name: string | null;
  mobile: string;
  wardId: string | null;
  familyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Card() {
  const { data: session } = useSession();
  const { data: parishoner } = api.parishoner.getParishonerDetails.useQuery();
  const [mobileInput, setMobileInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const isFamilyHead = parishoner?.family?.head?.userId === parishoner?.userId;
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);

  const [mobileNumbers, setMobileNumbers] = useState<
    { id: string; name: string; mobile: string }[]
  >([]);

  useEffect(() => {
    if (parishoner) {
      const members = parishoner?.family?.members ?? [];
      setFamilyMembers(members);
      setMobileNumbers(
        members.map((member) => ({
          id: member.id,
          name: member.userId ?? "Unknown",
          mobile: member.mobile ?? "",
        })),
      );
    }
  }, [parishoner, isFamilyHead]);

  const verifyMobileMutation = api.family.verifyMobile.useMutation({
    onSuccess: () => {
      alert("Mobile number verified! You are now linked as a Parishoner.");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleVerify = () => {
    setIsVerifying(true);

    verifyMobileMutation.mutate(
      { mobile: mobileInput },
      {
        onSuccess: () => {
          window.location.reload();
        },
        onSettled: () => {
          setIsVerifying(false);
        },
      },
    );
  };

  const updateMobileMutation = api.family.updateMobile.useMutation({
    onSuccess: () => {
      alert("Mobile number updated successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleChange = (id: string, newMobile: string) => {
    setMobileNumbers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, mobile: newMobile } : m)),
    );
  };

  const handleSave = (id: string, mobile: string) => {
    if (!isFamilyHead) return; // Prevent non-family heads from submitting
    updateMobileMutation.mutate({ parishonerId: id, mobile });
  };

  return (
    <div className="relative mx-auto flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary/20 p-4 shadow-lg">
      <div className="-z-10 absolute inset-0 pt-[170%] md:pt-[110%] flex items-center justify-center overflow-hidden h-[100%]">
        <div className="animate-wave absolute h-[170%] w-[200%] rounded-[40%] bg-gradient-to-br from-primary via-accent to-secondary opacity-40"></div>
        <div className="animate-wave-second absolute h-[170%] w-[200%] rounded-[40%] bg-gradient-to-br from-primary via-accent to-secondary opacity-40"></div>
        <div className="animate-wave-third absolute h-[170%] w-[200%] rounded-[40%] bg-gradient-to-br from-primary via-accent to-secondary opacity-40"></div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center text-center overflow-y-auto">
        <div className="mb-4">
          <Image
            src={session?.user.image ?? "/default-avatar.png"}
            alt="User Icon"
            width={128}
            height={128}
            className="rounded-xl"
          />
        </div>
        <p className="text-2xl font-bold text-primary">{session?.user.name}</p>
        <p className="text-lg font-semibold text-primary">
          {session?.user.role}
        </p>
        <p className="text-lg font-semibold text-primary">
          {parishoner ? parishoner?.ward?.name : "Not linked to a Parishoner"}
        </p>
      </div>

      {/* Mobile Verification Section */}
      <div className="mt-6 w-full max-w-md">
        {!parishoner ? (
          <div className="flex flex-col items-center">
            <p className="text-lg font-semibold text-primary">
              Enter your mobile number:
            </p>

            <input
              type="text"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="mt-2 w-[60%] rounded border bg-primary p-2 text-center text-textcolor placeholder-textcolor"
              placeholder="Enter mobile number"
            />
            <Button
              onClick={handleVerify}
              className="mt-5 rounded bg-primary px-4 py-2"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold text-primary">
              Family Members:
            </p>
            {familyMembers?.map((member) => (
              <div
                key={member.id}
                className="mt-2 flex w-full max-w-md flex-col items-center"
              >
                <p className="text-lg font-bold text-primary">
                  {member.name ?? "Unknown"}:
                </p>
                <div className="flex w-[90%] flex-row items-center justify-center gap-2 md:w-[60%]">
                  <input
                    type="text"
                    value={
                      mobileNumbers.find((m) => m.id === member.id)?.mobile ??
                      ""
                    }
                    onChange={(e) => handleChange(member.id, e.target.value)}
                    className="w-[100%] rounded border bg-primary p-2 text-center text-textcolor"
                    disabled={!isFamilyHead}
                  />
                  {isFamilyHead && (
                    <Button
                      onClick={() => {
                        const currentMobile =
                          mobileNumbers.find((m) => m.id === member.id)
                            ?.mobile ?? "";
                        if (member.mobile !== currentMobile) {
                          handleSave(member.id, member.mobile);
                        }
                      }}
                      className={`ml-3 h-9 ${
                        member.mobile ===
                        mobileNumbers.find((m) => m.id === member.id)?.mobile
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dummy Section */}
      <div className="mt-6 w-full max-w-md text-center text-textcolor"></div>
    </div>
  );
}
