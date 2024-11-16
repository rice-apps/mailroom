"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ScanLine, Barcode, Edit2, ChevronDown } from "lucide-react";


import { createClient } from '@/utils/supabase/client';

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

const recipients = ["Ovik Das", "Aditya Viswanathan"];

export default function ScanCheckin() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRecipients, setFilteredRecipients] = useState(recipients);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null);
  const [buffer, setBuffer] = useState('');

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
      console.error('Error accessing serial port:', error);
    }
  };

  const readData = async (reader) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const decodedValue = value;
        setBuffer((prevBuffer) => {
          const newBuffer = prevBuffer + decodedValue;
          const crlfIndex = newBuffer.indexOf('\r');
          if (crlfIndex !== -1) {
            const completeLine = newBuffer.slice(0, crlfIndex);
            setTrackingNumber(completeLine);
            return newBuffer.slice(crlfIndex + 2); 
          }
          return newBuffer;
        });
      }
    } catch (error) {
      console.error('Error reading from serial port:', error);
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
    setBuffer(''); 
  };

  useEffect(() => {
    setFilteredRecipients(
      recipients.filter((recipient) =>
        recipient.toLowerCase().includes(recipientName.toLowerCase())
      )
    );
  }, [recipientName]);

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


  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (trackingNumber && recipientName) {
  //     console.log("Package submitted:", { trackingNumber, recipientName });
  //     setTrackingNumber("");
  //     setRecipientName("");
  //     setIsManualInput(false);
  //   }
  // };

  const toggleManualInput = () => {
    setIsManualInput(!isManualInput);
  };

  const handleRecipientInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipientName(e.target.value);
    setShowDropdown(true);
  };

  const handleRecipientSelect = (recipient: string) => {
    setRecipientName(recipient);
    setShowDropdown(false);
  };


  //code from checkin

  
  interface PackageInfo {
    id?: string;
    // recipient_name?: string;
    // email?: string;
    date_added?: string;
    package_identifier?: string;
    claimed: boolean;
    date_claimed?: string;
    extra_information?: string;
    user_id?: string;
  }
    const [formData, setFormData] = useState<PackageInfo>({
      claimed: false,
    });
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      // console.log(formData.package_identifier);
    };


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("handlSubmit")
      const { error } = await supabase
        .from('packages')
        .insert([
          {
            claimed: formData.claimed,
            date_claimed: formData.date_claimed,
            // recipient_name: formData.recipient_name,
            // email: formData.email,
            date_added: formData.date_added,
            package_identifier: formData.package_identifier,
            extra_information: formData.extra_information,
            user_id: "a7d79e13-bdb3-4d8b-af8f-1f346eb3e1b0",
          },
        ]);
  
      if (error) {
        console.error("Error inserting package info:", error.message);
        setConfirmationMessage("Error submitting data. Please try again.");
      } else {
        console.log("Package info inserted successfully!");
        setConfirmationMessage("Package information submitted successfully!");
      }
    };

  

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-black dark:text-white mb-4">
          Check in Package
        </h1>
        <div className="mb-6 relative">
          <div className="relative w-64 h-64 mx-auto bg-white dark:bg-gray-700 rounded-3xl shadow-inner flex items-center justify-center overflow-hidden">
            <Package className="w-32 h-32 text-gray-400 dark:text-gray-500 absolute" />
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
                isScanning ? "opacity-100" : "opacity-0"
              }`}
            >
              <ScanLine
                className={`w-64 h-64 text-green-500 ${isScanning ? "animate-pulse" : ""}`}
              />
            </div>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            {isScanning
              ? "Ready to scan package"
              : "Place package under scanner"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="tracking-number"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tracking Number
              </Label>
              <button type="button" className="relative group">
                <span className="w-4 h-4 bg-black text-gray-300 dark:text-gray-200 rounded-full flex items-center justify-center text-xs">
                  ?
                </span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-700 text-white text-xs rounded-md shadow-lg">
                  Scan the tracking number using the scanner or enable manual
                  input to enter it manually.
                </div>
              </button>
            </div>
            <div className="relative">
              <Input
                id="tracking-number"
                type="text"
                name="package_identifier"
                value={formData.package_identifier || ''}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 ${
                  isManualInput
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-200 dark:bg-gray-700"
                } border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 ${
                  isManualInput ? "" : "cursor-not-allowed"
                }`}
                placeholder={
                  isManualInput
                    ? "Enter tracking number"
                    : "Scan in tracking number with scanner"
                }
                readOnly={!isManualInput}
              />
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <Button
                type="button"
                onClick={toggleManualInput}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
              >
                <Edit2 className="w-4 h-4" />
                <span className="sr-only">
                  {isManualInput ? "Disable" : "Enable"} manual input
                </span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="recipient-name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recipient Name
            </Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Input
                  id="recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={handleRecipientInputChange}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pr-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  placeholder="Enter recipient's name"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              {showDropdown &&
                recipientName.length >= 3 &&
                filteredRecipients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredRecipients.map((recipient, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleRecipientSelect(recipient)}
                      >
                        {recipient}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={
              !formData.package_identifier ||
              !recipientName ||
              !recipients.includes(recipientName)
            }
          >
            Check-in Package
          </Button>

          {!port ? (
          <button onClick={requestPort}>Connect Barcode Scanner</button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}
