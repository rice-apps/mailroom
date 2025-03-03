"use client";

import {
  Search,
  Package,
  User,
  LogOut,
  Pencil,
  Plus,
  Upload,
  Bell,
  ChevronUp,
  ChevronDown,
  Calendar,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "../hooks/use-toast";

// Assuming these functions are defined in the specified path
import { fetchStudentsGivenCollege } from "../../api/admin";
import checkAuth from "../../api/checkAuth";
import AddModalComponent from "./AddModalComponent";
import ExportModalComponent from "./ExportModalComponent";
import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import DateRangePickerDropdown, {
  DateRange,
} from "@/components/ui/date-range-picker";

const supabase = createClient();

const collegeContacts = [
  { collegeName: "Lovett", name: "Sharon O'Leary", email: "sko1@rice.edu" },
  { collegeName: "Baker", name: "Kristen Luu", email: "kl161@rice.edu" },
  { collegeName: "Will Rice", name: "Amanda Garza", email: "ag276@rice.edu" },
  { collegeName: "Hanszen", name: "Joyce Bald", email: "joyce@rice.edu" },
  { collegeName: "Wiess", name: "Jenny Toups", email: "jt87@rice.edu" },
  { collegeName: "Jones", name: "Kellie Sager", email: "ks235@rice.edu" },
  { collegeName: "Brown", name: "Christy Cousins", email: "cc233@rice.edu" },
  { collegeName: "Sid", name: "Lisa Galloy", email: "lgalloy@rice.edu" },
  { collegeName: "Martel", name: "Bonnie Stroman", email: "brs3126@rice.edu" },
  {
    collegeName: "McMurtry",
    name: "Jackie Carrizales",
    email: "jjc3@rice.edu",
  },
  { collegeName: "Duncan", name: "Wendy Olivares", email: "wo5@rice.edu" },
];

interface CollegeContact {
  name: string;
  email: string;
  collegeName: string;
}

interface Package {
  claimed: boolean;
  date_added: string;
  date_claimed: string;
  extra_information: string;
  id: string;
  package_identifier: string;
  user_id: string;
}

interface Student {
  id: number;
  name: string;
  netid: string;
  email: string;
  packages: Package[];
  numOfValidPackages: number;
}

export default function Component() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = async () => {
    console.log("Checking authorization...");
    try {
      const response = await checkAuth();

      setIsAuthorized(response.can_add_and_delete_packages === true);
      setCoord({
        collegeName: response.college,
        name: response.name,
        email: response.email,
      });
    } catch (error) {
      console.error("Authorization check failed:", error);
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const [coord, setCoord] = useState<CollegeContact | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toggle, setToggle] = useState(true);

  const [deliveryDateRange, setDeliveryDateRange] = useState<DateRange | null>(
    null,
  );

  const [minPackages, setMinPackages] = useState(0);

  const { toast } = useToast();

  const handleClick = async (netID: string, trackingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("resend", {
        body: { netID, trackingId },
      });

      if (error) throw error;

      toast({
        title: "Successfully sent a reminder to the student",
      });
    } catch (error) {
      console.error("Error invoking function:", error);
    }
  };

  useEffect(() => {
    const currentCoord = coord;
    if (currentCoord) {
      setCoord(currentCoord);
      setLoading(true);
      fetchStudentsGivenCollege(currentCoord.collegeName)
        .then((result) => {
          setStudents(result);
          setLoading(false);

          // update number of valid packages based on claim
          result.map((student: Student) => {
            student.numOfValidPackages = 0;
            const { packages } = student;
            packages.map((pkg) => {
              if (!pkg.claimed) {
                student.numOfValidPackages += 1;
              }
            });
          });
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
          setLoading(false);
        });
    }
  }, [coord]);

  const filteredStudents = students?.filter((student) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unclaimed" &&
        student.packages.some((pkg) => !pkg.claimed)) ||
      (filter === "claimed" && student.packages.every((pkg) => pkg.claimed));
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinPackages = student.numOfValidPackages >= minPackages;
    const matchesDateRange =
      !deliveryDateRange ||
      !deliveryDateRange.startDate ||
      !deliveryDateRange.endDate ||
      student.packages.some(
        (pkg) =>
          pkg.date_added &&
          deliveryDateRange.startDate &&
          deliveryDateRange.endDate &&
          new Date(pkg.date_added) >= deliveryDateRange.startDate &&
          new Date(pkg.date_added) <= deliveryDateRange.endDate,
      );

    return (
      matchesFilter && matchesSearch && matchesMinPackages && matchesDateRange
    );
  });

  return (
    <>
      {showAddModal && coord && (
        <AddModalComponent
          college={coord?.collegeName}
          exitModal={() => setShowAddModal(false)}
        />
      )}
      {showExportModal && coord && (
        <ExportModalComponent
          college={coord?.collegeName}
          exitModal={() => setShowExportModal(false)}
        />
      )}
      {!isAuthorized ? (
        <div className="flex flex-1 items-center justify-center bg-white h-screen">
          <h1 className="text-2xl font-semibold text-black">
            401 - Unauthorized
          </h1>
        </div>
      ) : (
        <div className="flex h-screen bg-white">
          <div className="hidden w-64 bg-gray-100 lg:flex flex-col px-4">
            <div className="flex items-center gap-4 pt-4">
              <Image
                src="/mailroom_logo.png"
                width={64}
                height={64}
                alt=""
                priority={true}
              />
              <span className="text-lg font-semibold text-[#00205B] leading-6">
                Mailroom <br></br> Admin
              </span>
            </div>
            <div className="mt-4 space-y-2 pl-[10px]">
              <Button
                variant="ghost"
                className="flex items-center w-full text-[#00205B] justify-start hover:bg-gray-200 font-semibold"
              >
                <Pencil className="w-5 h-5 mr-2" />
                Manage Admin
              </Button>

              <Button
                variant="ghost"
                className="flex items-center w-full text-[#00205B] justify-start hover:bg-gray-200 font-semibold"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Students
              </Button>

              <Button
                variant="ghost"
                className="flex items-center w-full text-[#00205B] justify-start hover:bg-gray-200 font-semibold"
                onClick={() => setShowExportModal(true)}
              >
                <Upload className="w-5 h-5 mr-2" />
                Export Claims
              </Button>

              <Button
                variant="ghost"
                className="flex items-center w-full text-[#00205B] justify-start hover:bg-gray-200 font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex items-center justify-between bg-white px-6 pt-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">
                  Hi {coord?.name}! Track all packages here
                </h1>
              </div>
              <div className="flex items-center gap-4 bg-white">
                <Button className="hover:bg-white" variant="ghost" size="icon">
                  <User className="h-5 w-5 text-[#00205B]" />
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-col gap-4 md:w-full md:flex-row text-[#656565]">
                  <Button
                    variant="ghost"
                    className="border rounded-3xl font-medium"
                    onClick={() => {
                      filteredStudents?.forEach((student) => {
                        if (student.numOfValidPackages > 0) {
                          handleClick(
                            student.email.split("@")[0],
                            "Your package has arrived!",
                          );
                        }
                      });
                    }}
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Remind All Students
                  </Button>
                  <DateDeliveredDropdown
                    dateRange={deliveryDateRange}
                    setDateRange={setDeliveryDateRange}
                  />
                  <PackagesDropdown
                    minPackages={minPackages}
                    setMinPackages={setMinPackages}
                  />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white rounded-3xl font-medium">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Packages</SelectItem>
                      <SelectItem value="unclaimed">Unclaimed</SelectItem>
                      <SelectItem value="claimed">Claimed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex w-full md:w-auto">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Search names..."
                      className="pl-8 bg-white text-black rounded-3xl font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <PackageTable
                loading={loading}
                filteredStudents={filteredStudents}
                toggle={toggle}
                handleClick={handleClick}
              />
            </main>
          </div>
        </div>
      )}
    </>
  );
}

interface PackageTableProps {
  loading: boolean;
  filteredStudents?: Student[];
  toggle: boolean;
  handleClick: (netID: string, trackingId: string) => Promise<void>;
}

function PackageTable({
  loading,
  filteredStudents,
  toggle,
  handleClick,
}: PackageTableProps) {
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {},
  );

  const toggleRow = (studentId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  return (
    <Card>
      <Table>
        {/** HACK: adding forced roundedness for now on the top */}
        <TableHeader className="text-base bg-[#00205B] text-white rounded-t-lg">
          <TableRow>
            <TableHead className="text-white w-[5%] first:rounded-tl-lg"></TableHead>
            <TableHead className="text-white w-[25%]">Student</TableHead>
            <TableHead className="text-white w-[25%]">Rice Email</TableHead>
            <TableHead className="text-white w-[20%]">Rice NetID</TableHead>
            <TableHead className="text-white w-[15%]"># of Packages</TableHead>
            <TableHead className="text-white w-[10%] last:rounded-tr-lg">
              Remind
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents?.map((student) => {
              if (!toggle && student.numOfValidPackages === 0) {
                return null;
              }

              return (
                <React.Fragment key={student.id}>
                  <TableRow
                    className="text-black cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleRow(student.id)}
                  >
                    <TableCell className="w-[5%]">
                      {student.numOfValidPackages > 0 ? (
                        expandedRows[student.id] ? (
                          <ChevronUp className="text-[#00205B]" />
                        ) : (
                          <ChevronDown className="text-[#00205B]" />
                        )
                      ) : (
                        <ChevronDown className="text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium w-[25%]">
                      {student.name}
                    </TableCell>
                    <TableCell className="w-[25%]">{student.email}</TableCell>
                    <TableCell className="w-[20%]">
                      {student.email.split("@")[0]}
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <Badge
                        variant={
                          student.numOfValidPackages > 0
                            ? "default"
                            : "secondary"
                        }
                        className="bg-[#00205B] text-white hover:bg-black px-4 py-1"
                      >
                        {student.numOfValidPackages}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[10%]">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={student.numOfValidPackages === 0}
                        className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white rounded-3xl px-5"
                        onClick={() =>
                          handleClick(
                            student.email.split("@")[0],
                            "Your package has arrived!",
                          )
                        }
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expandedRows[student.id] &&
                    student.numOfValidPackages > 0 && (
                      <>
                        {student.packages.map((pkg, index) => (
                          <>
                            <TableRow
                              key={`${student.id}-package-${index}`}
                              className="bg-gray-100"
                            >
                              <TableCell className="w-[5%]"></TableCell>
                              <TableCell className="w-[25%]">
                                {pkg.extra_information ||
                                  "Package details unavailable"}
                              </TableCell>
                              <TableCell className="w-[25%]"></TableCell>
                              <TableCell className="w-[20%]">
                                <Badge className="bg-gray-400 text-white px-3 py-1">
                                  Delivered
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[15%]"></TableCell>
                              <TableCell className="text-gray-500 w-[10%]">
                                {`Scanned ${Math.floor(
                                  (new Date().getTime() -
                                    new Date(pkg.date_added).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )} ${
                                  Math.floor(
                                    (new Date().getTime() -
                                      new Date(pkg.date_added).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ) === 1
                                    ? "day"
                                    : "days"
                                } ago`}
                              </TableCell>
                            </TableRow>
                          </>
                        ))}
                      </>
                    )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function DateDeliveredDropdown({
  dateRange,
  setDateRange,
}: {
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-3xl px-4 py-2 border border-gray-300"
        >
          <Calendar className="w-5 h-5 text-gray-600" />
          {dateRange?.startDate && dateRange?.endDate
            ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
            : "Date Delivered"}

          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-white shadow-lg rounded-lg p-4"
        align="start"
      >
        <div className="flex justify-between items-center pb-2">
          <span className="font-semibold text-lg">Date Delivered</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <DateRangePickerDropdown
          onDatesChange={setDateRange}
          initialDateRange={dateRange}
        />
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            className="rounded-3xl px-4 py-2 border border-gray-300"
            onClick={() => setDateRange(null)}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PackagesDropdown({
  minPackages,
  setMinPackages,
}: {
  minPackages: number;
  setMinPackages: (minPackages: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-3xl px-4 py-2 border border-gray-300"
        >
          <Package className="w-5 h-5 text-gray-600" />
          {minPackages === 0
            ? "Number of Packages"
            : `${minPackages}+ packages`}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-white shadow-lg rounded-lg p-4"
        align="start"
      >
        <div className="flex justify-between items-center pb-2">
          <span className="font-semibold text-lg">Minimum Packages</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <Input
            type="number"
            value={minPackages}
            onChange={(e) => setMinPackages(Number(e.target.value))}
            className="w-24"
            min={0}
          />
          <Button
            variant="outline"
            className="rounded-3xl px-4 py-2 border border-gray-300"
            onClick={() => setMinPackages(0)}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
