"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ScanLine, Barcode, Edit2, ChevronDown } from "lucide-react";

const recipients = ["Ovik Das", "Aditya Viswanathan"];

export default function ScanCheckin() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRecipients, setFilteredRecipients] = useState(recipients);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (trackingNumber && recipientName) {
      console.log("Package submitted:", { trackingNumber, recipientName });
      setTrackingNumber("");
      setRecipientName("");
      setIsManualInput(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-black dark:text-white mb-4">
          Check in Package
        </h1>
        <div className="mb-6 relative">
          <div className="relative w-64 h-64 mx-auto bg-white dark:bg-gray-700 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
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
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
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
              {showDropdown && filteredRecipients.length > 0 && (
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
              !trackingNumber ||
              !recipientName ||
              !recipients.includes(recipientName)
            }
          >
            Check-in Package
          </Button>
        </form>
      </div>
    </div>
  );
}
