import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  totalMeals: number;
  totalDeposits: number;
  totalCosts: number;
  balance: number;
}

interface MembersTableProps {
  members: Member[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * MembersTable Component
 * Displays paginated table of members with their financial summaries
 */
export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Members Summary</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Meals</TableHead>
              <TableHead className="text-right">Deposits</TableHead>
              <TableHead className="text-right">Costs</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{member.totalMeals}</TableCell>
                  <TableCell className="text-right">
                    Rs. {member.totalDeposits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    Rs. {member.totalCosts.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span
                      className={
                        member.balance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      Rs. {Math.abs(member.balance).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        member.balance >= 0 ? 'default' : 'destructive'
                      }
                    >
                      {member.balance >= 0 ? 'To Receive' : 'To Pay'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loading}
            >
              Load More
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
