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
  AlertTriangle,
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
import { useToast } from "../../hooks/use-toast";

// Assuming these functions are defined in the specified path
import {
  fetchStudentsGivenCollege,
  updateAdmin,
  userExists,
} from "../../../api/admin";
import checkAuth from "../../../api/checkAuth";
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
import { signOutAction } from "../../actions";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

// Assuming these functions are defined in the specified path

// ----------------------------------
// Supabase + Contacts
// ----------------------------------
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
  preferred_name?: string;
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
  preferred_name: string | null;
  netid: string;
  email: string;
  packages: Package[];
  numDeliveredPackages: number;
  numClaimedPackages: number;
  can_add_and_delete_packages: boolean;
  isAdmin?: boolean;
}

// The "current" coordinator's email for the incoming version
const currentCollegeCoordEmail = "jt87@rice.edu";

export default function Component() {
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
  const router = useRouter();

  // States for the Admin Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [netID, setNetID] = useState("");

  const { toast } = useToast();

  function resetDialog(): any {
    if (!isDialogOpen) {
      document.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (window.getComputedStyle(el).pointerEvents === "none") {
          console.log(el, "is diabled");
          el.style.pointerEvents = "auto";
        }
      });
    }
  }

  const fetchCoord = async () => {
    console.log("Fetching coordinator...");
    try {
      const response = await checkAuth();
      setCoord({
        collegeName: response.college,
        name: response.name,
        email: response.email,
        preferred_name: response.preferred_name,
      });
    } catch (error) {
      console.error("Coordinator fetching failed:", error);
    }
  };

  const handleClick = async (
    netID: string,
    redirectUrl: string,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    try {
      const { data, error } = await supabase.functions.invoke("resend", {
        body: { netID, redirectUrl },
      });

      if (error) throw error;

      toast({
        title: "Successfully sent a reminder to the student",
      });
    } catch (error) {
      console.error("Error invoking function:", error);
    }
  };

  // Add/Remove admin
  const handleAdminSubmit = async () => {
    if (!netID) return;

    try {
      if (actionType === "add") {
        // Your logic to add an admin
        if (await userExists(netID)) {
          console.log(`Adding admin with netID: ${netID}`);
          toast({ title: `Successfully added ${netID} as admin.` });
          updateAdmin(netID, true);
        } else {
          console.log(`User with netID: ${netID} could not be found.`);
          toast({ title: `Failed to add ${netID} as admin.` });
        }
      } else {
        // Your logic to remove an admin
        if (await userExists(netID)) {
          console.log(`Removing admin with netID: ${netID}`);
          toast({ title: `Successfully removed ${netID} as admin.` });
          updateAdmin(netID, false);
        } else {
          console.log(`User with netID: ${netID} could not be found.`);
          toast({ title: `Failed to remove ${netID} as admin.` });
        }
      }
    } catch (err) {
      console.error("Error in handleAdminSubmit", err);
      toast({
        title: "Error",
        description: "Something went wrong while updating admins.",
      });
    } finally {
      setIsDialogOpen(false);
      setTimeout(() => (document.body.style.pointerEvents = ""), 0);
      setNetID("");
    }
  };

  useEffect(() => {
    fetchCoord();
  }, []);

  useEffect(() => {
    const currentCoord = coord;
    if (currentCoord) {
      setCoord(currentCoord);
      setLoading(true);
      fetchStudentsGivenCollege(currentCoord.collegeName)
        .then(async (result) => {
          // Use Promise.all to handle all async calls
          const updated = await Promise.all(
            result.map(async (student: Student) => {
              // Update number of valid packages based on claim
              student.numDeliveredPackages = 0;
              student.numClaimedPackages = 0;
              const { packages } = student;
              packages.map((pkg) => {
                if (!pkg.claimed) {
                  student.numDeliveredPackages += 1;
                } else {
                  student.numClaimedPackages += 1;
                }
              });

              // Fetch admin status for each student asynchronously
              let isAdmin = student.can_add_and_delete_packages;
              console.log(student.name, student.can_add_and_delete_packages);
              console.log(
                `Fetched admin status for ${student.netid}: ${isAdmin}`,
              );
              return { ...student, isAdmin: isAdmin ?? false };
            }),
          );

          setStudents(updated);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
          setLoading(false);
        });
    }
  }, [coord]);

  const filteredStudents = students?.filter((student) => {
    const hasMatchingPackage = student.packages.some((pkg) =>
      pkg.package_identifier.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const matchesFilter =
      filter === "all" ||
      (filter === "unclaimed" &&
        student.packages.some((pkg) => !pkg.claimed)) ||
      (filter === "claimed" && student.packages.some((pkg) => pkg.claimed));

    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hasMatchingPackage;

    const matchesMinPackages = getPackageCount(filter, student) >= minPackages;
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

  const nameConflicts = detectNameConflicts(students);

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

      <div className="flex h-screen bg-white">
        <div className="hidden w-64 bg-gray-100 lg:flex flex-col px-4">
          <div
            className="flex items-center gap-4 pt-4 cursor-pointer"
            onClick={() => {
              router.push("/home");
            }}
          >
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
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center w-full text-[#00205B] justify-start hover:bg-gray-200 font-semibold"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Manage Admin
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[220px] bg-white rounded-md p-1 shadow-md"
                  align="start"
                >
                  <DropdownMenu.Item
                    className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => {
                      setActionType("add");
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => {
                      setActionType("remove");
                      setIsDialogOpen(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Admin
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

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
              onClick={() => {
                signOutAction();
              }}
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
                Hi {coord?.preferred_name ?? coord?.name}! Track all packages
                here
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-white">
              <Button className="hover:bg-white" variant="ghost" size="icon">
                <User className="h-5 w-5 text-[#00205B]" />
              </Button>

              {/* Admin Dialog */}
              <Dialog.Root open={isDialogOpen} onOpenChange={resetDialog()}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                  <Dialog.Content
                    className="
                        fixed
                        top-1/2 left-1/2
                        w-[90vw] max-w-sm
                        -translate-x-1/2 -translate-y-1/2
                        rounded-lg bg-white p-6
                        shadow-lg
                      "
                  >
                    <Dialog.Title className="text-lg font-semibold text-black">
                      {actionType === "add" ? "Add Admin" : "Remove Admin"}
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mt-1">
                      Please enter the netID of the admin to{" "}
                      {actionType === "add" ? "add" : "remove"}.
                    </Dialog.Description>

                    <div className="mt-4">
                      <Input
                        placeholder="Enter netID"
                        value={netID}
                        onChange={(e) => setNetID(e.target.value)}
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setTimeout(
                            () => (document.body.style.pointerEvents = ""),
                            0,
                          );
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAdminSubmit}>
                        {actionType === "add" ? "Add" : "Remove"}
                      </Button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-4 md:w-full md:flex-row text-[#656565]">
                <Button
                  variant="ghost"
                  className="border rounded-3xl font-medium"
                  onClick={(e) => {
                    filteredStudents?.forEach((student) => {
                      if (student.numDeliveredPackages > 0) {
                        handleClick(
                          student.email.split("@")[0],
                          window.origin + "/packages",
                          e,
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
                    placeholder="Search names, netID or packages..."
                    className="pl-8 bg-white text-black rounded-3xl font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <NameConflictWarning conflicts={nameConflicts} />

            <div className="flex flex-wrap gap-2 mb-4">
              {searchTerm && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 flex items-center gap-1"
                >
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}

              {filter !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 flex items-center gap-1"
                >
                  Status: {filter}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setFilter("all")}
                  />
                </Badge>
              )}

              {minPackages > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 flex items-center gap-1"
                >
                  Min packages: {minPackages}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setMinPackages(0)}
                  />
                </Badge>
              )}

              {deliveryDateRange?.startDate && deliveryDateRange?.endDate && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 flex items-center gap-1"
                >
                  Date range: {deliveryDateRange.startDate.toLocaleDateString()}{" "}
                  - {deliveryDateRange.endDate.toLocaleDateString()}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setDeliveryDateRange(null)}
                  />
                </Badge>
              )}
            </div>

            {students && filteredStudents && (
              <div className="text-sm text-gray-500 mb-4">
                Showing {filteredStudents.length} of {students.length} students
                {searchTerm && ` matching "${searchTerm}"`}
                {filter !== "all" && ` with ${filter} packages`}
                {minPackages > 0 && ` having ${minPackages}+ packages`}
                {deliveryDateRange?.startDate &&
                  deliveryDateRange?.endDate &&
                  ` delivered between ${deliveryDateRange.startDate.toLocaleDateString()} and ${deliveryDateRange.endDate.toLocaleDateString()}`}
              </div>
            )}

            <PackageTable
              loading={loading}
              filteredStudents={filteredStudents}
              toggle={toggle}
              handleClick={handleClick}
              currentFilter={filter}
              searchTerm={searchTerm}
            />
          </main>
        </div>
      </div>
    </>
  );
}

function getPackageCount(filter: string, student: Student) {
  return (
    (filter === "unclaimed" || filter === "all"
      ? student.numDeliveredPackages
      : 0) +
    (filter === "claimed" || filter === "all" ? student.numClaimedPackages : 0)
  );
}

interface PackageTableProps {
  loading: boolean;
  filteredStudents?: Student[];
  toggle: boolean;
  handleClick: (
    netID: string,
    redirectUrl: string,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  currentFilter: string;
  searchTerm: string;
}

function PackageTable({
  loading,
  filteredStudents,
  toggle,
  handleClick,
  currentFilter,
  searchTerm,
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      <Table>
        {/** HACK: adding forced roundedness for now on the top */}
        <TableHeader className="text-base bg-[#00205B] text-white rounded-t-lg">
          <TableRow>
            <TableHead className="text-white w-[5%] first:rounded-tl-lg"></TableHead>
            <TableHead className="text-white w-[25%]">
              Student / Details
            </TableHead>
            <TableHead className="text-white w-[25%]">
              Rice Email / Package ID
            </TableHead>
            <TableHead className="text-white w-[20%]">
              Rice NetID / Status
            </TableHead>
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
              if (!toggle && getPackageCount(currentFilter, student) === 0) {
                return null;
              }

              const filteredPackages = student.packages.filter((pkg) => {
                const matchesSearch =
                  !searchTerm ||
                  pkg.package_identifier
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  (pkg.extra_information &&
                    pkg.extra_information
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()));

                const matchesFilter =
                  currentFilter === "all" ||
                  (currentFilter === "claimed" && pkg.claimed) ||
                  (currentFilter === "unclaimed" && !pkg.claimed);

                return matchesSearch && matchesFilter;
              });

              const hasFilteredPackages = filteredPackages.length > 0;

              return (
                <React.Fragment key={student.id}>
                  <TableRow
                    className="text-black cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleRow(student.id)}
                  >
                    <TableCell className="w-[5%]">
                      {hasFilteredPackages ? (
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
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <span>{student.name}</span>
                          {student.preferred_name &&
                            student.preferred_name !== student.name && (
                              <span className="text-xs text-gray-500">
                                {student.preferred_name}
                              </span>
                            )}
                        </div>
                        {student.isAdmin && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[25%]">{student.email}</TableCell>
                    <TableCell className="w-[20%]">
                      {student.email.split("@")[0]}
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <Badge
                        variant={
                          getPackageCount(currentFilter, student) > 0
                            ? "default"
                            : "secondary"
                        }
                        className="bg-[#00205B] text-white hover:bg-black px-4 py-1"
                      >
                        {!searchTerm && currentFilter == "all"
                          ? `${getPackageCount(currentFilter, student)}`
                          : `${filteredPackages.length} of ${getPackageCount(currentFilter, student)}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[10%]">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={student.numDeliveredPackages === 0}
                        className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white rounded-3xl px-5"
                        onClick={(e) =>
                          handleClick(
                            student.email.split("@")[0],
                            window.origin + "/packages",
                            e,
                          )
                        }
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expandedRows[student.id] && hasFilteredPackages && (
                    <>
                      {filteredPackages.map((pkg, index) => (
                        <TableRow
                          key={`${student.id}-package-${index}`}
                          className="bg-gray-100"
                        >
                          <TableCell className="w-[5%]"></TableCell>
                          <TableCell className="w-[25%]">
                            {pkg.extra_information ||
                              "Package details unavailable"}
                          </TableCell>
                          <TableCell className="w-[25%] font-medium text-blue-700">
                            {pkg.package_identifier}
                          </TableCell>
                          <TableCell className="w-[20%]">
                            {pkg.claimed ? (
                              <Badge
                                className="bg-green-400 text-white px-3 py-1 cursor-help"
                                title={`Claimed on: ${formatDateTime(pkg.date_claimed)}`}
                              >
                                Claimed
                              </Badge>
                            ) : (
                              <Badge
                                className="bg-gray-400 text-white px-3 py-1 cursor-help"
                                title={`Delivered on: ${formatDateTime(pkg.date_added)}`}
                              >
                                Delivered
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="w-[15%]"></TableCell>
                          <TableCell className="text-gray-500 w-[10%]">
                            {(() => {
                              const now = new Date().getTime();
                              const addedDate = new Date(
                                !pkg.claimed
                                  ? pkg.date_added
                                  : pkg.date_claimed,
                              ).getTime();
                              const diffMs = now - addedDate;

                              const diffSeconds = Math.floor(diffMs / 1000);
                              const diffMinutes = Math.floor(diffSeconds / 60);
                              const diffHours = Math.floor(diffMinutes / 60);
                              const diffDays = Math.floor(diffHours / 24);
                              const baseAction = pkg.claimed
                                ? "Claimed"
                                : "Added";
                              if (diffSeconds < 60) {
                                return `${baseAction} just now`;
                              } else if (diffMinutes < 60) {
                                return `${baseAction} ${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
                              } else if (diffHours < 24) {
                                return `${baseAction} ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
                              } else {
                                return `${baseAction} ${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
                              }
                            })()}
                          </TableCell>
                        </TableRow>
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

const detectNameConflicts = (students: Student[] | null) => {
  if (!students || students.length === 0) return [];

  const packageNameMap = new Map<string, Student[]>();

  students.forEach((student) => {
    const displayName = student.preferred_name || student.name;
    const normalizedName = displayName.trim().toLowerCase();

    if (!packageNameMap.has(normalizedName)) {
      packageNameMap.set(normalizedName, [student]);
    } else {
      packageNameMap.get(normalizedName)!.push(student);
    }
  });

  const conflicts = [];

  for (const [normalizedName, studentsWithName] of packageNameMap.entries()) {
    if (studentsWithName.length > 1) {
      conflicts.push({
        name: studentsWithName[0].preferred_name || studentsWithName[0].name,
        students: studentsWithName,
      });
    }
  }

  return conflicts;
};

function NameConflictWarning({ conflicts }: { conflicts: any[] }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
        <div>
          <h3 className="font-medium text-amber-800">Name Conflict Warning</h3>
          <p className="text-amber-700 text-sm mb-2">
            Multiple students share the same name for package identification.
            This could cause confusion when scanning packages.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
            {conflicts.map((conflict, index) => (
              <li key={index}>
                "{conflict.name}" is used by {conflict.students.length}{" "}
                students:{" "}
                <span className="italic">
                  {conflict.students
                    .map((s: { email: string }) => s.email.split("@")[0])
                    .join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
