'use client'

import { Search, Package, User } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "../hooks/use-toast"

// Assuming these functions are defined in the specified path
import { fetchStudentsGivenCollege } from "../../api/admin"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "")

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
  { collegeName: "Duncan", name: "Wendy Olivares", email: "wo5@rice.edu" }
]

interface CollegeContact {
  name: string
  email: string
  collegeName: string
}

interface Package {
  claimed: boolean
  date_added: string
  date_claimed: string
  extra_information: string
  id: string
  package_identifier: string
  user_id: string
}

interface Student {
  id: number
  name: string
  netid: string
  email: string
  packages: Package[]
}

const currentCollegeCoordEmail = "jt87@rice.edu"

export default function Component() {
  const [coord, setCoord] = useState<CollegeContact | null>(null)
  const [students, setStudents] = useState<Student[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { toast } = useToast()

  const handleClick = async (netID: string, trackingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('resend', {
        body: { netID, trackingId }
      })

      if (error) throw error

      toast({
        title: "Successfully sent a reminder to the student",
      })

    } catch (error) {
      console.error('Error invoking function:', error)
    }
  }

  useEffect(() => {
    const currentCoord = collegeContacts.find(contact => contact.email === currentCollegeCoordEmail)
    if (currentCoord) {
      setCoord(currentCoord)
      setLoading(true)
      fetchStudentsGivenCollege(currentCoord.collegeName)
        .then(result => {
          setStudents(result)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error fetching students:", error)
          setLoading(false)
        })
    }
  }, [])

  const filteredStudents = students?.filter(student => {
    const matchesFilter = filter === "all" || 
      (filter === "unclaimed" && student.packages.some(pkg => !pkg.claimed)) ||
      (filter === "claimed" && student.packages.every(pkg => pkg.claimed))
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden w-64 bg-gray-100 lg:block">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Package className="mr-2 h-6 w-6 text-[#00205B]" />
          <span className="text-lg font-semibold text-[#00205B]">Rice Package Admin</span>
        </div>
        <div className="mt-4 px-4 space-y-2">
          <div className="text-sm font-medium text-gray-600">College Coordinator</div>
          <div className="text-[#00205B] font-semibold">{coord?.name}</div>
          <div className="text-sm text-gray-600">{coord?.email}</div>
          <div className="text-sm text-gray-600">Net ID: {coord?.email.split("@")[0]}</div>
          <div className="text-sm font-medium text-[#00205B] mt-4">Assigned College</div>
          <div className="text-lg font-bold text-[#00205B]">{coord?.collegeName}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-[#00205B]">{coord?.collegeName} College</h1>
          </div>
          <div className="flex items-center gap-4 bg-white">
            <Button className="hover:bg-white" variant="ghost" size="icon">
              <User className="h-5 w-5 text-[#00205B]" />
            </Button>
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
                  <TableHead className="text-black"># of Packages To Pick Up</TableHead>
                  <TableHead className="text-black">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredStudents?.map((student) => (
                  <TableRow key={student.id} className="text-black">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.email.split("@")[0]}</TableCell>
                    <TableCell>
                      <Badge variant={student.packages.length > 0 ? "default" : "secondary"} className="bg-[#00205B] text-white hover:bg-black">
                        {student.packages.filter((x) => !x.claimed).length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={student.packages.length === 0}
                        className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white"
                        onClick={() => handleClick(student.email.split("@")[0], "Your package has arrived!")}
                      >
                        Remind
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </div>
  )
}