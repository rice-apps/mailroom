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
import { Info, PlusCircle, X } from "lucide-react";
import Papa from "papaparse";
import { insertUsersGivenCollege } from "@/api/admin";
import { parse } from "path";

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
        Papa.parse<StudentData>(file, {
          header: true,
          complete: (results: Papa.ParseResult<StudentData>) => {
            if (results.errors.length > 0) {
              setError(
                "Error parsing CSV file: " +
                  [...results.errors.map((e) => e.message)].join(", \n"),
              );
            } else {
              const parsedData = results.data as StudentData[];
              if (parsedData.length > 0) {
                console.log("HEEEEEEEEEHEEE");
                setStudents(parsedData);
              } else {
                setError('CSV file must have "Full Name" and "netID" columns');
              }
            }
          },
          error: (error: Error) => {
            setError(`Error reading file: ${error.message}`);
          },
        });
      }
    },
    [],
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Update Student List for {college}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <Info size="18" className="text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Important Information
                </h3>
                <ul className="list-disc pl-4 text-sm text-blue-900 space-y-1">
                  <li>
                    Upload a CSV file with columns: "Full Name" and "netID"
                  </li>
                  <li>
                    This will replace the entire student list for {college}
                  </li>
                  <li>
                    Any students not included in this upload will be removed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
        {error && (
          <p className="text-red-500 mb-4 whitespace-pre-wrap max-h-32 overflow-y-scroll ">
            {error}
          </p>
        )}
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
                    <TableCell className="text-gray-600">
                      {student["Full Name"]}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {student["netID"]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            className="mr-2 bg-white text-black border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={exitModal}
          >
            Exit
          </Button>
          <Button
            className="bg-[#00205B] text-white hover:bg-black"
            onClick={() => {
              insertUsersGivenCollege(college, students).then((data) => {
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
