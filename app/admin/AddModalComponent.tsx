"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, X } from "lucide-react";
import Papa from "papaparse";
import { insertUsersGivenCollege } from "@/api/admin";

type StudentData = {
  "Full Name": string;
  netID: string;
};

export default function AddModalComponent({
  college,
  exitModal,
}: {
  college: string;
  exitModal: () => void;
}) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<StudentData>({
    "Full Name": "",
    netID: "",
  });
  const [showManualAdd, setShowManualAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      input.value = "";
      if (file) {
        setError(null);
        Papa.parse(file, {
          header: true,
          complete: (results: Papa.ParseResult<StudentData>) => {
            if (results.errors.length > 0) {
              setError("Error parsing CSV file");
            } else {
              const parsedData = results.data as StudentData[];
              if (parsedData.length > 0) {
                setStudents(parsedData);
              } else {
                setError('CSV file must have "Full Name" and "netID" columns');
              }
            }
          },
          error: (error: Papa.ParseError) => {
            setError(`Error reading file: ${error.message}`);
          },
        });
      }
    },
    []
  );

  const handleManualAdd = () => {
    if (newStudent["Full Name"] && newStudent["netID"]) {
      setStudents((prev) => [...prev, newStudent]);
      setNewStudent({ "Full Name": "", netID: "" });
      setError(null);
    } else {
      setError("Please fill in both Full Name and netID");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleReplaceCSV = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleManualAdd = () => {
    setShowManualAdd((prev) => !prev);
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Add Students to {college}
        </h2>
        <div className="mb-4 flex space-x-2 items-center">
          <Button
            onClick={handleReplaceCSV}
            className="bg-[#00205B] text-white hover:bg-black"
          >
            {students.length > 0 ? "Replace CSV" : "Choose CSV File"}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={toggleManualAdd}
            variant="ghost"
            size="icon"
            className="ml-2"
            aria-label={showManualAdd ? "Hide manual add" : "Show manual add"}
          >
            {showManualAdd ? (
              <X className="h-4 w-4" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {showManualAdd && (
          <div className="mb-4 flex space-x-2">
            <Input
              name="Full Name"
              value={newStudent["Full Name"]}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
            <Input
              name="netID"
              value={newStudent["netID"]}
              onChange={handleInputChange}
              placeholder="netID"
            />
            <Button
              onClick={handleManualAdd}
              className="bg-[#00205B] text-white hover:bg-black"
            >
              Add Student
            </Button>
          </div>
        )}
        {students.length > 0 && (
          <div className="mb-4 max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>netID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{student["Full Name"]}</TableCell>
                    <TableCell>{student["netID"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            className="mr-2 bg-gray-300 text-black hover:bg-gray-400"
            onClick={exitModal}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#00205B] text-white hover:bg-black"
            onClick={() => {
              insertUsersGivenCollege("Wiess", students).then((data) => {
                exitModal();
              });
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
