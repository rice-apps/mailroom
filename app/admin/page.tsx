"use client"

import { Search, Package, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "../hooks/use-toast"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Dialog from "@radix-ui/react-dialog"

// Assuming these functions are defined in the specified path
import { fetchStudentsGivenCollege, updateAdmin, userExists } from "../../api/admin"


// ----------------------------------
// Supabase + Contacts
// ----------------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

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
  { collegeName: "McMurtry", name: "Jackie Carrizales", email: "jjc3@rice.edu" },
  { collegeName: "Duncan", name: "Wendy Olivares", email: "wo5@rice.edu" },
]

// ----------------------------------
// Types/Interfaces
// ----------------------------------
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
  id: number
  name: string
  netid: string
  email: string
  packages: Package[]
  can_add_and_delete_packages:boolean
  // Add optional isAdmin field (default false if undefined)
  isAdmin?: boolean
}

// The "current" coordinator's email
const currentCollegeCoordEmail = "jt87@rice.edu"

// ----------------------------------
// Main Component
// ----------------------------------
export default function Page() {
  const [coord, setCoord] = useState<CollegeContact | null>(null)
  const [students, setStudents] = useState<Student[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // States for the Admin Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"add" | "remove">("add")
  const [netID, setNetID] = useState("")

  const { toast } = useToast()
  //todo: figure out a better way to do dialogs lol
  function resetDialog():any {
    
    if (!isDialogOpen) {
      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        
        if (window.getComputedStyle(el).pointerEvents === 'none') {
          console.log(el,"is diabled")
          el.style.pointerEvents = 'auto';
        }
      });
    }
  }

  // Resend (Remind) handler
  const handleClick = async (netID: string, trackingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("resend", {
        body: { netID, trackingId },
      })

      if (error) throw error;

      toast({
        title: "Successfully sent a reminder to the student",
      })
    } catch (error) {
      console.error("Error invoking function:", error)
    }
  };

  // Fetch coordinator & students
  useEffect(() => {
    const currentCoord = collegeContacts.find(
      (contact) => contact.email === currentCollegeCoordEmail
    );
    
    if (currentCoord) {
      setCoord(currentCoord);
      setLoading(true);
      
      fetchStudentsGivenCollege(currentCoord.collegeName)
        .then(async (result) => {
          // Use Promise.all to handle all async calls
          const updated = await Promise.all(result.map(async (student: Student) => {
            // Fetch admin status for each student asynchronously
            let isAdmin = student.can_add_and_delete_packages
            console.log(student.name,student.can_add_and_delete_packages)
            console.log(`Fetched admin status for ${student.netid}: ${isAdmin}`);
            return { ...student, isAdmin: isAdmin ?? false };
          }));
          
          setStudents(updated);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
          setLoading(false);
        });
    }
  }, []);

  // Filter Logic
  const filteredStudents = students?.filter((student) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unclaimed" && student.packages.some((pkg) => !pkg.claimed)) ||
      (filter === "claimed" && student.packages.every((pkg) => pkg.claimed))

    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Add/Remove admin
  const handleAdminSubmit = async () => {
    if (!netID) return

    try {
      if (actionType === "add") {
        // Your logic to add an admin
        if(await userExists(netID)){
          console.log(`Adding admin with netID: ${netID}`)
          toast({ title: `Successfully added ${netID} as admin.` })
          updateAdmin(netID, true)
        }
        else{
          console.log(`User with netID: ${netID} could not be found.`)
          toast({ title: `Failed to add ${netID} as admin.` })
        }
        
      } else {
        // Your logic to remove an admin
        if(await userExists(netID)){
          console.log(`Removing admin with netID: ${netID}`)
          toast({ title: `Successfully removed ${netID} as admin.` })
          updateAdmin(netID, false)
        }
        else{
          console.log(`User with netID: ${netID} could not be found.`)
          toast({ title: `Failed to remove ${netID} as admin.` })
        }
      }
    } catch (err) {
      console.error("Error in handleAdminSubmit", err)
      toast({
        title: "Error",
        description: "Something went wrong while updating admins.",
      })
    } finally {
      setIsDialogOpen(false)
      setTimeout(()=> (document.body.style.pointerEvents = ""),0)
      setNetID("")
    }
  }

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="flex h-screen bg-white">
      {/* LEFT SIDEBAR */}
      <div className="hidden w-64 bg-gray-100 lg:block">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Package className="mr-2 h-6 w-6 text-[#00205B]" />
          <span className="text-lg font-semibold text-[#00205B]">
            Rice Package Admin
          </span>
        </div>
        <div className="mt-4 px-4 space-y-2">
          <div className="text-sm font-medium text-gray-600">College Coordinator</div>
          <div className="text-[#00205B] font-semibold">{coord?.name}</div>
          <div className="text-sm text-gray-600">{coord?.email}</div>
          <div className="text-sm text-gray-600">
            Net ID: {coord?.email.split("@")[0]}
          </div>
          <div className="text-sm font-medium text-[#00205B] mt-4">
            Assigned College
          </div>
          <div className="text-lg font-bold text-[#00205B]">{coord?.collegeName}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-[#00205B]">
              {coord?.collegeName} College
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-white">
            <Button className="hover:bg-white" variant="ghost" size="icon">
              <User className="h-5 w-5 text-[#00205B]" />
            </Button>

            {/* MANAGE ADMINS (RADIX UI DROPDOWN) */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white"
                >
                  Manage Admins
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] rounded-md border border-gray-200 bg-white p-1 shadow-md"
                  sideOffset={6}
                >

                  <DropdownMenu.Item
                    onClick={() => {
                      setActionType("add")

                      setIsDialogOpen(true)
                      setTimeout(()=> (document.body.style.pointerEvents = ""),0)

                    }}
                    className="cursor-pointer rounded-sm px-2 py-1 text-sm text-black hover:bg-gray-100 focus:bg-gray-100 outline-none"
                  >
                    Add Admin
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    onClick={() => {
                      setActionType("remove")
                      setIsDialogOpen(true)
                      setTimeout(()=> (document.body.style.pointerEvents = ""),0)
                    }}
                    className="cursor-pointer rounded-sm px-2 py-1 text-sm text-black hover:bg-gray-100 focus:bg-gray-100 outline-none"
                  >
                    Remove Admin
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* ADD/REMOVE ADMIN DIALOG */}
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
                      onClick={() =>{
                        
                        setIsDialogOpen(false)
                        setTimeout(()=> (document.body.style.pointerEvents = ""),0)
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
            <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white text-black">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-8 bg-white text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Card>
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Rice Email</TableHead>
                  <TableHead className="text-black">Rice NetID</TableHead>
                  <TableHead className="text-black">
                    # of Packages To Pick Up
                  </TableHead>
                  <TableHead className="text-black">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id} className="text-black">
                      <TableCell className="font-medium">
                        {student.name}
                        {/* BADGE: Show if user is admin */}
                        {student.isAdmin && (
                          <Badge
                            className="ml-2 bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.email.split("@")[0]}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.packages.some((pkg) => !pkg.claimed)
                              ? "default"
                              : "secondary"
                          }
                          className="bg-[#00205B] text-white hover:bg-black"
                        >
                          {student.packages.filter((x) => !x.claimed).length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={student.packages.length === 0}
                          className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white"
                          onClick={() =>
                            handleClick(
                              student.email.split("@")[0],
                              "Your package has arrived!"
                            )
                          }
                        >
                          Remind
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </div>
  )
}

