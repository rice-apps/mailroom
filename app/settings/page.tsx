import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function UserDetails() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [textNotifications, setTextNotifications] = useState(false);

  const handleSaveChanges = () => {
    // Handle save logic
    console.log('Changes saved');
  };

  const handleDeleteAccount = () => {
    // Handle delete account logic
    console.log('Account deleted');
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="border rounded-2xl shadow-lg p-6 bg-white">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Name</span>
              <span>Eugenia Sung</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rice Email</span>
              <span>eys3@rice.edu</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NetID</span>
              <span>eys3</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Residential College</span>
              <span>Martel</span>
            </div>
            <Input
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              placeholder="Enter Additional Email"
              value={additionalEmail}
              onChange={(e) => setAdditionalEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl shadow-lg p-6 bg-white">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-sm text-gray-500">What notifications do you want to see?</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📧 Email</span>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💬 Text Message</span>
            </div>
            <Switch checked={textNotifications} onCheckedChange={setTextNotifications} />
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
