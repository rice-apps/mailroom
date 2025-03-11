"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Barcode, ChevronDown, Edit2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ScanIcon from "@/components/scan-icon";
import { TextArea } from "@/components/ui/textarea";
import Slider from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import { claimPackage } from "@/api/packages";
const supabase = createClient();

declare global {
  interface Navigator {
    serial: any;
  }
  interface SerialPort {
    open: (options: { baudRate: number }) => Promise<void>;
    readable: ReadableStream;
    close: () => Promise<void>;
  }
}

type ScanMode = "checkin" | "claim"

export default function ScanCheckin() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRecipients, setFilteredRecipients] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ScanMode>("checkin");
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode') as ScanMode;
    if (mode) {
      setCurrentView(mode);
    }
  }, []);
 
  useEffect(() => {
    const fetchRecipients = async () => {
      const { data, error } = await supabase.from("users").select("id, name");
      if (error) {
        console.error("Error fetching recipients:", error.message);
      } else {
        const recipientMap = data.reduce(
          (acc: Record<string, string>, user: { id: string; name: string }) => {
            acc[user.name] = user.id;
            return acc;
          },
          {},
        );
        setUserMap(recipientMap);
        setFilteredRecipients(Object.keys(recipientMap));
      }
    };
    fetchRecipients();
  }, []);

  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<string> | null>(null);
  const [buffer, setBuffer] = useState("");

  interface PackageInfo {
    id?: string;
    date_added?: string;
    package_identifier?: string;
    claimed: boolean;
    date_claimed?: string;
    extra_information?: string;
    user_id?: string;
  }

  const [formData, setFormData] = useState<PackageInfo>({
    claimed: false,
    package_identifier: "",
  });

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null,
  );

  const handleTrackingNumberChange = (value: string) => {
    setTrackingNumber(value);
    setFormData((prev) => ({
      ...prev,
      package_identifier: value,
    }));
  };

  const requestPort = async () => {
    try {
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x01a86 }],
      });
      await port.open({ baudRate: 9600 });
      setPort(port);
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      setReader(reader);

      readData(reader);
    } catch (error) {
      console.error("Error accessing serial port:", error);
    }
  };

  const readData = async (reader: ReadableStreamDefaultReader<string>) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const newBuffer = buffer + value;
        const crlfIndex = newBuffer.indexOf("\r");
        if (crlfIndex !== -1) {
          const completeLine = newBuffer.slice(0, crlfIndex);
          handleTrackingNumberChange(completeLine);
          setBuffer(newBuffer.slice(crlfIndex + 2));
        } else {
          setBuffer(newBuffer);
        }
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
    }
  };

  const closePort = async () => {
    if (reader) {
      await reader.cancel();
      await reader.releaseLock();
      setReader(null);
    }
    if (port) {
      await port.close();
      setPort(null);
    }
    setBuffer("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleManualInput = () => {
    setIsManualInput(!isManualInput);
  };

  const handleRecipientInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientName(e.target.value);
    setShowDropdown(true);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleRecipientSelect = (recipient: string) => {
    setRecipientName(recipient);
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("packages").insert([
      {
        claimed: formData.claimed,
        date_claimed: formData.date_claimed,
        package_identifier: formData.package_identifier,
        extra_information: notes,
        user_id: userMap ? userMap[recipientName] : "",
      },
    ]);
    const { data, error: fetchIDError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userMap ? userMap[recipientName] : "")
      .single();

    if (fetchIDError) {
      console.error("Error fetching user:", error);
      setConfirmationMessage("Error fetching user data. Please try again.");
    }

    if (data) {
      const { error: resendError } = await supabase.functions.invoke("resend", {
        body: {
          netID: data.email.split("@")[0],
          redirectUrl: window.origin + "/packages",
        },
      });
      if (resendError) {
        setConfirmationMessage("Error submitting data. Please try again.");
      }
    }

    if (error) {
      console.error("Error inserting package info:", error.message);
      setConfirmationMessage("Error submitting data. Please try again.");
    } else {
      setConfirmationMessage("Package information submitted successfully!");
      setTimeout(() => {
        setConfirmationMessage(null);
      }, 3000);
      // Reset form after successful submission
      setTrackingNumber("");
      setRecipientName("");
      setNotes("");
      setFormData({
        claimed: false,
        package_identifier: "",
        extra_information: "",
      });
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleClaim = async () => {
    try {
      const res = await claimPackage(trackingNumber);
      setConfirmationMessage("Package claimed successfully!");
      setTrackingNumber("");
    } catch (error) {
      setConfirmationMessage("Error claiming package. Please try again.");
      console.error("Error claiming package:", error);
    }
    setTimeout(() => {
      setConfirmationMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-8">
        <div className="mb-4 flex items-center px-8">
          <button className="p-2" onClick={handleBackClick}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-3xl font-semibold text-center pr-10">
            {currentView === "checkin" ? "Check in a Package" : "Claim a Package"}
          </h1>
        </div>

        <div className="w-full flex justify-center mb-4">
          <div className="relative w-64 h-10 bg-gray-100 rounded-full p-1 cursor-pointer border border-black">
            <Slider
              views={[
                { id: "checkin", content: "Scan" },
                { id: "claim", content: "Claim" },
              ]}
              className="w-full h-full"
              onViewChange={(view) => {
                setCurrentView(view as ScanMode);
                setTrackingNumber("");
                setFormData((prev) => ({
                  ...prev,
                  package_identifier: "",
                }));
              }}
              initialViewIndex={currentView == "checkin" ? 0 : 1}
            />
          </div>
        </div>

        {currentView === "checkin" && (
          <>
            <p className="mb-4 text-center text-gray-500">
              Connect scanner and scan the package barcode
            </p>

            <div className="mb-4 flex justify-center px-8">
              <div className="h-64 w-64 rounded-3xl border-2 border-black flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <ScanIcon className="h-[7.5rem] w-[7.5rem]" />
                  </div>
                  <Button
                    className="rounded-full bg-white text-navy-900 border border-black px-6 py-2 hover:bg-gray-100"
                    onClick={requestPort}
                    type="button"
                  >
                    Scan Barcode
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4 text-center text-gray-500">
              <div className="h-[1px] bg-gray-300 w-40 mr-4"></div>
              or manually enter information
              <div className="h-[1px] bg-gray-300 w-40 ml-4"></div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-xl mx-auto"
            >
              <div className="space-y-1">
                <div className="flex items-center">
                  {/* <Label htmlFor="tracking-number" className="text-gray-600 w-40">
                    Tracking Number
                  </Label> */}
                  <Input
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    className="flex-1 rounded-full border-black"
                    placeholder="Enter Tracking Number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center relative" ref={dropdownRef}>
                  <Label htmlFor="student-name" className="text-gray-600 w-40">
                    Student's Name
                  </Label>
                  <div className="flex-1 relative">
                    <Input
                      id="student-name"
                      type="text"
                      value={recipientName}
                      onChange={handleRecipientInputChange}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full rounded-full border-black pr-10"
                      placeholder="Enter Student's Name"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                    {showDropdown && filteredRecipients.length > 0 && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[12rem] overflow-auto">
                        {filteredRecipients
                          .filter((name) =>
                            name
                              .toLowerCase()
                              .includes(recipientName.toLowerCase()),
                          )
                          .map((recipient, index) => (
                            <li
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleRecipientSelect(recipient)}
                            >
                              {recipient}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center">
                  <Label
                    htmlFor="delivery-notes"
                    className="text-gray-600 w-40 justify-self-start"
                  >
                    Delivery Notes
                  </Label>
                  <TextArea
                    id="delivery-notes"
                    value={notes}
                    onChange={handleNoteChange}
                    className="flex-1 rounded-3xl border-black min-h-10"
                    placeholder="Some special notes about the delivery..."
                    accessKey=""
                  />
                </div>
              </div>

              {confirmationMessage && (
                <div
                  className={`text-center p-3 rounded-md font-medium ${
                    confirmationMessage.includes("Error")
                      ? "bg-red-200 text-red-800 border border-red-300"
                      : "bg-green-200 text-green-800 border border-green-300"
                  }`}
                >
                  {confirmationMessage}
                </div>
              )}

              <div className="pt-1 flex justify-center pb-1">
                <button
                  type="submit"
                  className="w-36 rounded-full bg-[#00205B] text-white py-1.5 font-medium text-base"
                  disabled={!trackingNumber || !recipientName}
                  style={{
                    opacity: !trackingNumber || !recipientName ? "0.6" : "1",
                  }}
                >
                  Add Package
                </button>
              </div>
            </form>
          </>
        )}

        {currentView === "claim" && (
          <>
            <p className="mb-4 text-center text-gray-500">
              Connect scanner and scan the package barcode
            </p>

            <div className="mb-4 flex justify-center px-8">
              <div className="h-64 w-64 rounded-3xl border-2 border-black flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <ScanIcon className="h-[7.5rem] w-[7.5rem]" />
                  </div>
                  <Button
                    className="rounded-full bg-white text-navy-900 border border-black px-6 py-2 hover:bg-gray-100"
                    onClick={requestPort}
                    type="button"
                  >
                    Scan Barcode
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4 text-center text-gray-500">
              <div className="h-[1px] bg-gray-300 w-40 mr-4"></div>
              or manually enter information
              <div className="h-[1px] bg-gray-300 w-40 ml-4"></div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-xl mx-auto"
            >
              <div className="space-y-1">
                <div className="flex items-center">
                  {/* <Label htmlFor="tracking-number" className="text-gray-600 w-40">
                    Tracking Number
                  </Label> */}
                  <Input
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    className="flex-1 rounded-full border-black"
                    placeholder="Enter Tracking Number"
                  />
                </div>
              </div>

              {confirmationMessage && (
                <div
                  className={`text-center p-3 rounded-md font-medium ${
                    confirmationMessage.includes("Error")
                      ? "bg-red-200 text-red-800 border border-red-300"
                      : "bg-green-200 text-green-800 border border-green-300"
                  }`}
                >
                  {confirmationMessage}
                </div>
              )}

              <div className="pt-1 flex justify-center pb-1">
                <button
                  type="button"
                  className="w-36 rounded-full bg-[#00205B] text-white py-1.5 font-medium text-base"
                  disabled={!trackingNumber}
                  style={{
                    opacity: !trackingNumber ? "0.6" : "1",
                  }}
                  onClick={handleClaim}
                >
                  Claim Package
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
