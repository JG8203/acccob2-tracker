import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Form from 'next/form'

import { prisma } from "@/lib/prisma";
import { getSearchResults } from "@/actions/tracker";
import next from "next";

export default function SearchAttendance() {
    return (
        <Form action="/search">
            <input name="eventId" />
            <input type="submit" value="Search" />
        </Form>
    )
}