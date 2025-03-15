// @ts-nocheck
// TO:DO - Unfortunately, line 89 seems to be a bug with tsc somehow, or I might be tripping. Either way we should probably remove this no check soon.
"use client";

import { Button } from "@/components/ui/button";
import DateRangePickerDropdown, {
  DateRange,
} from "@/components/ui/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function ExportModalComponent({
  college,
  exitModal,
}: {
  college: string;
  exitModal: () => void;
}) {
  const [pickupDateRange, setPickupDateRange] = useState<DateRange | null>(
    null,
  );
  const [checkinDateRange, setCheckinDateRange] = useState<DateRange | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [packages, setPackages] = useState<
    {
      package_identifier: string;
      date_added: Date | null;
      date_claimed: Date | null;
      extra_information: string;
      claimed: boolean;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }[]
  >([]);

  const supabase = createClient();

  useEffect(() => {
    setRefreshing(true);
    // Fetch data from API
    supabase
      .from("packages")
      .select(
        `
            package_identifier,
            date_added,
            date_claimed,
            extra_information,
            claimed,
            users!inner (
                id,
                name,
                email,
                college
            )`,
      )
      .eq("users.college", college)
      .then((data) => {
        if (data.error) {
          console.error("Error fetching packages:", data.error);
          return;
        }
        setPackages(
          data.data
            .map((pkg) => {
              return {
                package_identifier: pkg.package_identifier,
                date_added: pkg.date_added ? new Date(pkg.date_added) : null,
                date_claimed: pkg.date_claimed
                  ? new Date(pkg.date_claimed)
                  : null,
                extra_information: pkg.extra_information,
                claimed: pkg.claimed,
                user: {
                  id: pkg.users ? pkg.users.id : "",
                  name: pkg.users ? pkg.users.name : "",
                  email: pkg.users ? pkg.users.email : "",
                },
              };
            })
            .filter((pkg) => {
              if (!pickupDateRange && !checkinDateRange) {
                return true;
              }
              if (!pickupDateRange && checkinDateRange) {
                return (
                  pkg.date_added &&
                  pkg.date_added >= checkinDateRange.startDate! &&
                  pkg.date_added <= checkinDateRange.endDate!
                );
              }
              if (pickupDateRange && !checkinDateRange) {
                return (
                  pkg.date_claimed &&
                  pkg.date_claimed >= pickupDateRange.startDate! &&
                  pkg.date_claimed <= pickupDateRange.endDate!
                );
              }
              return (
                pkg.date_added &&
                pkg.date_claimed &&
                pkg.date_added >= checkinDateRange!.startDate! &&
                pkg.date_added <= checkinDateRange!.endDate! &&
                pkg.date_claimed >= pickupDateRange!.startDate! &&
                pkg.date_claimed <= pickupDateRange!.endDate!
              );
            }),
        );
        setRefreshing(false);
      });
  }, [pickupDateRange, checkinDateRange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Export for {college}</h2>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-row justify-around">
            {/* Export Modal for mail log with pick up and check in*/}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pick-up dates</label>
              <DateRangePickerDropdown onDatesChange={setPickupDateRange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in dates</label>
              <DateRangePickerDropdown onDatesChange={setCheckinDateRange} />
            </div>
          </div>

          <div>
            {refreshing && <p className="text-center">Loading...</p>}
            {!refreshing && packages.length > 0 && (
              <div className="mb-4 max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>netID</TableHead>
                      <TableHead>Package Identifier</TableHead>
                      <TableHead>Date Checked In</TableHead>
                      <TableHead>Date Claimed</TableHead>
                      <TableHead>Extra Information</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((checkinPackage, index) => (
                      <TableRow key={index}>
                        <TableCell>{checkinPackage.user.name}</TableCell>
                        <TableCell>{checkinPackage.user.email}</TableCell>
                        <TableCell>
                          {checkinPackage.package_identifier}
                        </TableCell>
                        <TableCell>
                          {checkinPackage.date_added?.toLocaleDateString() ||
                            ""}
                        </TableCell>
                        <TableCell>
                          {checkinPackage.date_claimed?.toLocaleDateString() ||
                            ""}
                        </TableCell>
                        <TableCell>
                          {checkinPackage.extra_information}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {
              // No packages found
              !refreshing && packages.length === 0 && (
                <p className="text-center">No packages found</p>
              )
            }
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            className="mr-2 text-black border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={() => exitModal()}
          >
            Exit
          </Button>
          <Button
            className="bg-[#00205B] text-white hover:bg-black"
            onClick={() => {
              const escapeCsvValue = (value: string) => {
                if (!value) {
                  return "";
                }

                if (
                  value.includes(",") ||
                  value.includes("\n") ||
                  value.includes('"')
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              };

              const csvContent = [
                [
                  "Full Name",
                  "netID",
                  "Package Identifier",
                  "Date Checked In",
                  "Date Claimed",
                  "Extra Information",
                ],
                ...packages.map((pkg) => [
                  escapeCsvValue(pkg.user.name),
                  escapeCsvValue(pkg.user.email),
                  escapeCsvValue(pkg.package_identifier),
                  escapeCsvValue(pkg.date_added?.toUTCString() || ""),
                  escapeCsvValue(pkg.date_claimed?.toUTCString() || ""),
                  escapeCsvValue(pkg.extra_information),
                ]),
              ]
                .map((e) => e.join(","))
                .join("\n");

              // me when i do funny user download override
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `packages_${college}.csv`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
