// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableFooter,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import Form from 'next/form'

export default function SearchAttendance() {
    return (
        <Form action="/search">
            <input name="eventId" />
            <input type="submit" value="Search" />
        </Form>
    )
}