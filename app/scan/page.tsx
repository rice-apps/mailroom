"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Barcode, ChevronDown, Edit2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
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

export default function ScanCheckin() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [studentNetID, setStudentNetID] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRecipients, setFilteredRecipients] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          {}
        );
        setUserMap(recipientMap);
        setFilteredRecipients(Object.keys(recipientMap));
      }
    };
    fetchRecipients();
  }, []);

  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null);
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

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientName(e.target.value);
    setShowDropdown(true);
  };

  const handleNetIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentNetID(e.target.value);
  };

  const handleRecipientSelect = (recipient: string) => {
    setRecipientName(recipient);
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        extra_information: formData.extra_information,
        user_id: userMap ? userMap[recipientName] : "",
      },
    ]);
    if (error) {
      console.error("Error inserting package info:", error.message);
      setConfirmationMessage("Error submitting data. Please try again.");
    } else {
      setConfirmationMessage("Package information submitted successfully!");
      // Reset form after successful submission
      setTrackingNumber("");
      setRecipientName("");
      setStudentNetID("");
      setFormData({
        claimed: false,
        package_identifier: "",
        extra_information: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center">
          <button className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1"></div>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-center">Scan in a Package</h1>
        <p className="mb-8 text-center text-gray-500">
          Scan the barcode or enter the tracking number, and enter the student's information
        </p>

        <div className="mb-12">
          <div className="mx-auto h-64 w-64 rounded-3xl border-2 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Barcode className="h-20 w-20 text-navy-900" />
              </div>
              <Button 
                className="rounded-full bg-white text-navy-900 border border-gray-300 px-6 py-2"
                onClick={requestPort}
                type="button"
              >
                Scan Barcode
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center">
              <Label htmlFor="tracking-number" className="text-gray-600 w-40">
                Tracking Number
              </Label>
              <Input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(e) => handleTrackingNumberChange(e.target.value)}
                className="flex-1 rounded-full border-gray-200"
                placeholder="Enter Tracking Number or Scan Barcode"
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
                  className="w-full rounded-full border-gray-200 pr-10"
                  placeholder="Enter Student's Name"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                
                {showDropdown && filteredRecipients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredRecipients
                      .filter(name => name.toLowerCase().includes(recipientName.toLowerCase()))
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
            <div className="flex items-center relative">
              <Label htmlFor="student-netid" className="text-gray-600 w-40">
                Student's NetID
              </Label>
              <div className="flex-1 relative">
                <Input
                  id="student-netid"
                  type="text"
                  value={studentNetID}
                  onChange={handleNetIDChange}
                  className="w-full rounded-full border-gray-200 pr-10"
                  placeholder="Enter Student's NetID"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {confirmationMessage && (
            <div
              className={`text-center p-2 rounded ${
                confirmationMessage.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {confirmationMessage}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium w-full rounded-lg bg-blue-700 text-white py-2 px-4 h-10"
              disabled={!trackingNumber || !recipientName || !studentNetID}
              style={{ opacity: (!trackingNumber || !recipientName || !studentNetID) ? '0.6' : '1' }}
            >
              Add Package
            </button>
          </div>
        </form>

        {/* Removed the Connect Barcode Scanner button since functionality is now in Scan Barcode button */}
      </div>
    </div>
  );
}