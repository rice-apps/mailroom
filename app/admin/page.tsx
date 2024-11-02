'use client'

import { Search, Package, User } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const collegeCoordinator = {
  name: "John Doe",
  email: "john.doe@rice.edu",
  netID: "jd123",
  college: "Baker"
}

const students = [
  { id: 1, name: "Alice Johnson", netid: "aj122", email: "alice@rice.edu", packages: 2 },
  { id: 2, name: "Bob Smith", netid: "bs992", email: "bob@rice.edu", packages: 1 },
  { id: 3, name: "Charlie Brown", netid: "cb921", email: "charlie@rice.edu", packages: 3 },
  { id: 4, name: "Diana Ross", netid: "dr011", email: "diana@rice.edu", packages: 0 },
  { id: 5, name: "Ethan Hunt", netid: "eh21", email: "ethan@rice.edu", packages: 1 },
]

export default function Component() {
  const totalPackages = students.reduce((sum, student) => sum + student.packages, 0)

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden w-64 bg-gray-100 lg:block">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Package className="mr-2 h-6 w-6 text-[#00205B]" />
          <span className="text-lg font-semibold text-[#00205B]">Rice Package Admin</span>
        </div>
        <div className="mt-4 px-4 space-y-2">
          <div className="text-sm font-medium text-gray-600">College Coordinator</div>
          <div className="text-[#00205B] font-semibold">{collegeCoordinator.name}</div>
          <div className="text-sm text-gray-600">{collegeCoordinator.email}</div>
          <div className="text-sm text-gray-600">Net ID: {collegeCoordinator.netID}</div>
          <div className="text-sm font-medium text-[#00205B] mt-4">Assigned College</div>
          <div className="text-lg font-bold text-[#00205B]">{collegeCoordinator.college}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-[#00205B]">{collegeCoordinator.college} College</h1>
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
              <Select defaultValue="all">
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
                <Input placeholder="Search students..." className="pl-8 bg-white text-black" />
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
                {students.map((student) => (
                  <TableRow key={student.id} className="text-black">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.netid}</TableCell>
                    <TableCell>
                      <Badge variant={student.packages > 0 ? "default" : "secondary"} className="bg-[#00205B] text-white hover:bg-black">
                        {student.packages}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={student.packages === 0}
                        className="bg-white border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white"
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