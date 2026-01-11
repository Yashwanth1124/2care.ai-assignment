# Testing Guide - Digital Health Wallet

This guide will help you verify that all features work correctly according to the healthcare workflow requirements.

## 🎯 Testing Objectives

Verify that the application:
1. ✅ Demonstrates a coherent healthcare workflow
2. ✅ Behaves like a real product
3. ✅ Handles all user states (empty, populated, shared)
4. ✅ Enforces proper access control
5. ✅ Maintains data consistency

---

## 📋 Pre-Testing Checklist

- [ ] Backend server is running (`npm run dev` or `npm run dev:backend`)
- [ ] Frontend server is running (`npm run dev` or `npm run dev:frontend`)
- [ ] Database is initialized (automatic on first backend start)
- [ ] Browser console is open (F12) to monitor for errors
- [ ] Network tab is open to verify API calls

---

## 🧪 Test Scenarios

### Scenario 1: First-Time User Registration & Setup

**Goal**: Verify user can create account and see empty states

#### Steps:
1. Navigate to `http://localhost:3000`
2. Click "Register here"
3. Fill in registration form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Register"

#### Expected Results:
- ✅ Successfully redirects to Dashboard
- ✅ Navbar shows "Welcome, Test User"
- ✅ Dashboard shows:
  - Empty state in Vitals Trends chart (or "No data available")
  - Summary cards show "N/A" for all vitals
  - Recent Reports shows "No reports uploaded yet"

#### Verify:
- [ ] User is logged in (no redirect to login)
- [ ] Empty states are displayed clearly
- [ ] No console errors

---

### Scenario 2: Record Vitals (Primary Data Entry)

**Goal**: Verify vital recording functionality

#### Steps:
1. On Dashboard, find "Record Vital" card (top-left)
2. Record BP:
   - Vital Type: `BP`
   - Value: `120`
   - Date & Time: Select today's date, current time
   - Click "Record Vital"
3. Record Sugar:
   - Vital Type: `Sugar`
   - Value: `95`
   - Date & Time: Select today's date, current time
   - Click "Record Vital"
4. Record Heart Rate:
   - Vital Type: `Heart Rate`
   - Value: `72`
   - Date & Time: Select today's date, current time
   - Click "Record Vital"

#### Expected Results:
- ✅ Success message after each entry
- ✅ Page reloads/refreshes
- ✅ Summary cards update:
  - BP card shows `120` and "1 records"
  - Sugar card shows `95` and "1 records"
  - Heart Rate card shows `72` and "1 records"
- ✅ Vitals Trends chart shows data when vital type is selected

#### Verify:
- [ ] All vitals saved successfully
- [ ] Summary cards show correct values
- [ ] Record counts are accurate
- [ ] Chart displays data correctly

#### Backend Check:
```bash
# Check database (optional - requires SQLite browser)
# Open: backend/database/healthwallet.db
# Table: vitals
# Should see 3 records with user_id matching your account
```

---

### Scenario 3: Upload Medical Report

**Goal**: Verify report upload and metadata storage

#### Steps:
1. On Dashboard, find "Upload Medical Report" card (top-right)
2. Prepare a test file (PDF or image):
   - Create a small PDF or use any medical report image
   - Or use any PDF/image file for testing
3. Upload Report:
   - File: Select your test file
   - Report Type: `Blood Test`
   - Report Date: Select today's date
   - Click "Upload Report"
4. Upload another report:
   - File: Select another test file
   - Report Type: `X-Ray`
   - Report Date: Select a date from last week
   - Click "Upload Report"

#### Expected Results:
- ✅ Success message after upload
- ✅ Recent Reports section updates
- ✅ Shows 2 reports with:
  - Correct file names
  - Correct report types
  - Correct dates
- ✅ "View All Reports" button is visible

#### Verify:
- [ ] Files uploaded successfully
- [ ] Reports appear in Recent Reports
- [ ] File names are correct
- [ ] Report types are correct
- [ ] Dates are correct
- [ ] Files exist in `backend/uploads/{user_id}/` directory

#### Backend Check:
```bash
# Check database
# Table: reports
# Should see 2 records with:
# - file_path pointing to uploaded files
# - report_type matching selection
# - report_date matching selection
```

---

### Scenario 4: Vitals Trends Visualization

**Goal**: Verify chart functionality and filtering

#### Steps:
1. Scroll to "Vitals Trends" section
2. Add more vitals for trend:
   - Record 3 more Sugar readings with different dates (spread over a week)
   - Record 2 more BP readings
3. Test Chart Display:
   - Select "Sugar" from dropdown
   - Check chart shows line graph with data points
   - Select "BP" from dropdown
   - Check chart updates
4. Test Date Filtering:
   - Set Start Date to 7 days ago
   - Set End Date to today
   - Verify chart updates with filtered data
   - Set Start Date to 30 days ago
   - Verify more data appears

#### Expected Results:
- ✅ Chart displays line graph when data exists
- ✅ Chart updates when vital type changes
- ✅ Date filtering works correctly
- ✅ Chart shows correct number of data points
- ✅ X-axis shows dates
- ✅ Y-axis shows values

#### Verify:
- [ ] Chart renders correctly
- [ ] Data points match recorded vitals
- [ ] Filtering works as expected
- [ ] Chart is responsive and readable
- [ ] Empty state shows when no data in date range

---

### Scenario 5: Summary Cards (Quick Health Snapshot)

**Goal**: Verify summary cards show latest values and counts

#### Steps:
1. Review Summary Cards section (below chart)
2. Record additional vitals:
   - Record another Sugar reading: `98` (today)
   - Record another BP reading: `125` (today)
   - Record Oxygen: `98` (today)
   - Record Temperature: `98.6` (today)
3. Refresh page or wait for auto-update

#### Expected Results:
- ✅ Each vital type shows a card
- ✅ Cards show latest value (most recent)
- ✅ Cards show record count
- ✅ Cards with data show values
- ✅ Cards without data show "N/A"

#### Verify:
- [ ] Latest values are displayed (not first values)
- [ ] Record counts are accurate
- [ ] All vital types are represented
- [ ] N/A shown for vitals with no data
- [ ] Values update after new entries

---

### Scenario 6: View All Reports & Filtering

**Goal**: Verify report listing and filtering

#### Steps:
1. Click "Reports" in navigation bar
2. View Reports Page:
   - Should see all uploaded reports
   - Reports displayed as cards
3. Test Filtering:
   - Filter by Report Type: Select "Blood Test"
   - Click "Apply Filters"
   - Verify only Blood Test reports shown
   - Clear filters
   - Filter by Date Range:
     - Start Date: 7 days ago
     - End Date: Today
     - Click "Apply Filters"
     - Verify reports filtered correctly
4. Test Report Actions:
   - Click "View" on a report
   - Verify file opens in new tab
   - Click "Download"
   - Verify file downloads

#### Expected Results:
- ✅ All reports displayed correctly
- ✅ Filtering by type works
- ✅ Filtering by date works
- ✅ View button opens file
- ✅ Download button downloads file
- ✅ Clear filters resets view

#### Verify:
- [ ] All uploaded reports are visible
- [ ] Filters work correctly
- [ ] File viewing works
- [ ] File download works
- [ ] Report metadata is correct

---

### Scenario 7: Report Sharing & Access Control

**Goal**: Verify sharing functionality and permissions

#### Steps:
1. **Register Second User:**
   - Logout from current account
   - Register new user:
     - Name: `Doctor User`
     - Email: `doctor@example.com`
     - Password: `password123`
   - Login with new account
   - Note: Should see empty dashboard (no reports)

2. **Share Report (from First Account):**
   - Logout
   - Login with first account (`test@example.com`)
   - Go to Reports page
   - Click "Share" on one report
   - Enter email: `doctor@example.com`
   - Click "Share Report"

3. **Verify Shared Access (Second Account):**
   - Logout
   - Login with `doctor@example.com`
   - Go to Reports page
   - Should see shared report (if shared endpoint implemented)
   - Try to view the shared report
   - Try to delete the shared report (should fail or not show delete button)

#### Expected Results:
- ✅ Sharing modal appears
- ✅ Sharing succeeds
- ✅ Shared user can view report
- ✅ Shared user CANNOT delete report (read-only)
- ✅ Shared user cannot see other reports

#### Verify:
- [ ] Sharing works via email
- [ ] Shared user can access report
- [ ] Access control enforced (read-only)
- [ ] Owner can still access their reports
- [ ] Delete button not visible/disabled for shared users

#### Backend Check:
```bash
# Check database
# Table: shared_access
# Should see record with:
# - report_id matching shared report
# - shared_with_email = 'doctor@example.com'
# - access_type = 'read'
```

---

### Scenario 8: Data Consistency & State Management

**Goal**: Verify data persists and updates correctly

#### Steps:
1. **Add Data:**
   - Login with first account
   - Add 2 more vitals
   - Upload 1 more report
   - Refresh page

2. **Verify Persistence:**
   - Check all vitals are still there
   - Check all reports are still there
   - Check summary cards are updated
   - Check chart data is correct

3. **Delete Test:**
   - Delete one report
   - Refresh page
   - Verify report is gone
   - Verify file is deleted from uploads folder

#### Expected Results:
- ✅ All data persists after refresh
- ✅ Deleted data is removed
- ✅ Summary cards update correctly
- ✅ Charts update correctly
- ✅ No orphaned data

#### Verify:
- [ ] Data persists correctly
- [ ] Deletions work correctly
- [ ] Summary cards reflect current state
- [ ] Charts reflect current data
- [ ] No data inconsistencies

---

### Scenario 9: Error Handling & Edge Cases

**Goal**: Verify error handling and edge cases

#### Steps:
1. **Invalid File Upload:**
   - Try to upload non-PDF/image file
   - Expected: Error message displayed

2. **Large File Upload:**
   - Try to upload file > 10MB
   - Expected: Error message displayed

3. **Invalid Vital Values:**
   - Try to submit vital form without value
   - Expected: Form validation error

4. **Future Date:**
   - Try to record vital with future date
   - Expected: Should work (or show warning)

5. **Unauthorized Access:**
   - Try to access /reports without login
   - Expected: Redirect to login

6. **Invalid Login:**
   - Try to login with wrong password
   - Expected: Error message

#### Expected Results:
- ✅ All errors handled gracefully
- ✅ Error messages are clear
- ✅ No crashes or console errors
- ✅ User experience remains smooth

#### Verify:
- [ ] Error messages are user-friendly
- [ ] No unhandled errors
- [ ] Validation works correctly
- [ ] Edge cases handled properly

---

### Scenario 10: Complete Healthcare Workflow

**Goal**: Simulate real-world usage pattern

#### Day 1 Simulation:
1. Register account
2. Record morning BP: `120/80`
3. Record morning Sugar: `95`
4. Upload Blood Test report from last week
5. View vitals chart
6. Review summary cards

#### Day 10 Simulation:
1. Login to account
2. Record new Sugar reading: `102`
3. View Sugar trend chart (should show both readings)
4. Upload follow-up Blood Test report
5. Share Blood Test with doctor
6. Verify report appears in list

#### Sharing Simulation:
1. Doctor receives shared report
2. Doctor views report (read-only)
3. Doctor cannot modify or delete
4. Owner can still access and delete

#### Expected Results:
- ✅ Workflow feels natural
- ✅ Data accumulates correctly
- ✅ Trends are visible
- ✅ Sharing works seamlessly
- ✅ Access control is enforced

---

## ✅ Final Verification Checklist

### Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Vital recording works
- [ ] Report upload works
- [ ] Vitals chart displays correctly
- [ ] Summary cards show correct data
- [ ] Report listing works
- [ ] Report filtering works
- [ ] Report sharing works
- [ ] Access control enforced

### Data Integrity
- [ ] Data persists after refresh
- [ ] Deletions work correctly
- [ ] Summary cards update correctly
- [ ] Charts reflect current data
- [ ] No data inconsistencies

### User Experience
- [ ] Empty states are clear
- [ ] Success messages appear
- [ ] Error messages are helpful
- [ ] Navigation is intuitive
- [ ] Forms validate correctly

### Security
- [ ] Authentication required
- [ ] Access control works
- [ ] Shared users are read-only
- [ ] Files are stored securely
- [ ] Passwords are hashed

### Healthcare Workflow
- [ ] Workflow feels natural
- [ ] Data accumulates over time
- [ ] Trends are meaningful
- [ ] Reports are accessible
- [ ] Sharing enables collaboration

---

## 🐛 Common Issues & Solutions

### Issue: Chart not displaying data
**Solution**: 
- Check browser console for errors
- Verify API calls are successful (Network tab)
- Check date range is correct
- Verify vitals were recorded with correct dates

### Issue: Reports not uploading
**Solution**:
- Check file size (max 10MB)
- Verify file type (PDF/Images only)
- Check backend logs for errors
- Verify uploads directory exists and is writable

### Issue: Sharing not working
**Solution**:
- Verify email matches exactly
- Check backend logs for errors
- Verify shared_access table has record
- Check API endpoint is working

### Issue: Summary cards show N/A
**Solution**:
- Record at least one vital of that type
- Refresh page
- Check browser console for errors
- Verify API returns data

---

## 📊 Success Criteria

Your application is **qualified** if:

1. ✅ **Data Presence**: At least 2-3 vitals and 1 report uploaded
2. ✅ **Feature Coverage**: All features work (vitals, reports, charts, sharing)
3. ✅ **Correct Permissions**: Owner can upload/share, Viewer is read-only
4. ✅ **Clean UX States**: Empty states, success messages, error handling
5. ✅ **Logical Flow**: Workflow feels natural and coherent

---

## 🎥 Screen Recording Checklist

When creating your demo video, show:

1. [ ] User registration
2. [ ] Recording vitals (2-3 different types)
3. [ ] Uploading reports (2 different reports)
4. [ ] Viewing vitals chart with different vital types
5. [ ] Summary cards showing data
6. [ ] Filtering reports
7. [ ] Sharing a report
8. [ ] Accessing shared report from different account
9. [ ] Code structure walkthrough
10. [ ] How to run locally

---

## 📝 Testing Notes Template

```
Date: ___________
Tester: ___________

Test Results:
- Registration: [ ] Pass [ ] Fail
- Vital Recording: [ ] Pass [ ] Fail
- Report Upload: [ ] Pass [ ] Fail
- Vitals Chart: [ ] Pass [ ] Fail
- Summary Cards: [ ] Pass [ ] Fail
- Report Filtering: [ ] Pass [ ] Fail
- Report Sharing: [ ] Pass [ ] Fail
- Access Control: [ ] Pass [ ] Fail

Issues Found:
1. _________________________________
2. _________________________________

Notes:
_____________________________________
```

---

**Good luck with your testing! 🏥💚**

If all scenarios pass, your application demonstrates a complete, coherent healthcare workflow and is ready for submission!