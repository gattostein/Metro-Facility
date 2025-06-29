'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';

// Interface for User Profile data
interface UserProfile {
    id: string;
    full_name: string | null;
    address: string | null;
    contact_number: string | null;
    abn: string | null;
    bsb: string | null;
    account_number: string | null;
    email: string | null;
}

// Define interfaces for data structures
interface Place {
    id: string;
    name: string;
    rate: number; 
    address?: string; 
}

// Interface for a single work entry being added or already added
interface WorkEntry {
    id: string; // Unique ID for the entry in the frontend state (optional, but good for keys)
    place_id: string | null; // Null for casual places
    casual_place_name: string | null; // Name for casual places
    // Simplified rate_type to reflect the hourly calculation basis
    rate_type: 'fixed_hourly' | 'casual'; // Use these to distinguish entry origin
    hours_worked: number; // Hours worked (required)
    hourly_rate: number; // Hourly rate for this specific entry (required)
    // Removed days_worked_week_1, days_worked_week_2
    // Removed extra_description, extra_amount
    work_date_start?: string; // Optional: specific date range for this entry
    work_date_end?: string; // Optional: specific date range for this entry
    amount: number; // Calculated amount (hours_worked * hourly_rate)
    // Add other fields if needed, e.g., description for the entry
}

// Function to generate the PDF (Added this function)
const generateInvoicePdf = (invoiceData: {
    invoiceStartDate: string;
    invoiceEndDate: string;
    workEntries: WorkEntry[];
    totalAmount: number;
    places: Place[];
    userProfile: UserProfile | null;
    // Add invoice number here when available
    invoiceNumber?: number | null; // Placeholder for invoice number
}) => {
    const doc = new jsPDF();

    let yOffset = 10;
    const margin = 15; // Increased margin for better spacing
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Logo (Placeholder) ---
    // You would typically add an image here. Example:
    doc.addImage("/logo.png", 'PNG', margin, yOffset, 50, 20); // Adjust position and size
    yOffset += 45; // Adjust yOffset based on logo height

    // --- Title ---
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const titleText = "Invoice";
    const titleWidth = doc.getTextWidth(titleText); // Obtiene el ancho del texto del título
    const centerX = (pageWidth - titleWidth) / 2; // Calcula la posición X para centrar

    doc.text(titleText, centerX, yOffset); // Dibuja el título en la posición centrada
    yOffset += lineHeight * 2;



    // --- Invoice Number ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    // Use a placeholder or the actual invoice number if passed
    //const invoiceNumberText = `Invoice Number: ${invoiceData.invoiceNumber || 'INV-XXXX'}`;
    const invoiceNumberText = `Invoice Number: ${invoiceData.invoiceNumber ? String(invoiceData.invoiceNumber).padStart(4, '0') : 'INV-XXXX'}`; // Formato con ceros iniciales

    doc.text(invoiceNumberText, margin, yOffset);
    yOffset += lineHeight * 2;

    // --- From and To Sections ---
    const col1X = margin;
    const col2X = pageWidth / 2; // Start the second column in the middle
    let currentSectionY = yOffset; // Usa un yOffset temporal para la columna 'From'
    

    // From Section (User Details - Placeholder)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("From:", col1X, currentSectionY);
    currentSectionY += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // Placeholder for user details - replace with actual data when available
    if (invoiceData.userProfile) {
        doc.text(invoiceData.userProfile.full_name || "Your Name/Company Name", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text(`ABN: ${invoiceData.userProfile.abn || '[Your ABN]'}`, col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text(`Phone: ${invoiceData.userProfile.contact_number || '[Your Phone]'}`, col1X, currentSectionY); currentSectionY += lineHeight;
        // Assuming email is not in user_profiles, keep placeholder or fetch separately
        doc.text(`Email: ${invoiceData.userProfile.email || '[Your Email]'}`, col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text(`BSB: ${invoiceData.userProfile.bsb || '[Your BSB]'}`, col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text(`Bank Account: ${invoiceData.userProfile.account_number || '[Your Account Number]'}`, col1X, currentSectionY); currentSectionY += lineHeight;
        // Add address if needed
        // doc.text(invoiceData.userProfile.address || '[Your Address]', col1X, currentSectionY); currentSectionY += lineHeight;
    } else {
        // Fallback to placeholders if profile data is not available
        doc.text("Your Name/Company Name", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text("ABN: [Your ABN]", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text("Phone: [Your Phone]", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text("Email: [Your Email]", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text("BSB: [Your BSB]", col1X, currentSectionY); currentSectionY += lineHeight;
        doc.text("Bank Account: [Your Account Number]", col1X, currentSectionY); currentSectionY += lineHeight;
    }    
    

    // To Section (Metro Facility Details)
    let tempYOffset = yOffset; // Inicializa tempYOffset con el yOffset actual

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("To:", col2X, tempYOffset);
    tempYOffset += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("METRO FACILITY NATURAL SERVICES PTY LTD", col2X, tempYOffset); tempYOffset += lineHeight;
    doc.text("ABN: 6961102885", col2X, tempYOffset); tempYOffset += lineHeight;
    // Add other address details if needed
    // doc.text("Address Line 1", col2X, tempYOffset); tempYOffset += lineHeight;
    // doc.text("Address Line 2", col2X, tempYOffset); tempYOffset += lineHeight;


    // Update yOffset to be below the lower of the two columns
    yOffset = Math.max(currentSectionY, tempYOffset) + lineHeight * 2;


    // Invoice Period (Keep this, maybe adjust position)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const formattedStartDate = invoiceData.invoiceStartDate.split('-').reverse().join('/');
    const formattedEndDate = invoiceData.invoiceEndDate.split('-').reverse().join('/');
    doc.text(`Invoice Period: ${formattedStartDate} to ${formattedEndDate}`, margin, yOffset);
    //doc.text(`Invoice Period: ${invoiceData.invoiceStartDate} to ${invoiceData.invoiceEndDate}`, margin, yOffset);
    yOffset += lineHeight * 2;


    // Work Entries Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Work Details:", margin, yOffset); // Changed header to "Work Details"
    yOffset += lineHeight;

    // Work Entries List
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    invoiceData.workEntries.forEach((entry) => {
        const placeName = entry.casual_place_name || invoiceData.places.find(p => p.id === entry.place_id)?.name || 'Unknown Place';
        // Format entry text clearly
        const entryText = `- ${placeName}: ${entry.hours_worked} hrs @ $${entry.hourly_rate.toFixed(2)}/hr = $${entry.amount.toFixed(2)}`;
        doc.text(entryText, margin + 5, yOffset); // Indent entries slightly
        yOffset += lineHeight;
    });

    // Add some space before total
    yOffset += lineHeight;

    // Total Amount
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount Due: $${invoiceData.totalAmount.toFixed(2)}`, margin, yOffset); // Changed text slightly
    yOffset += lineHeight * 3; // Add more space before footer

    // --- Footer ---
    doc.setFontSize(8); // Smaller font for footer
    doc.setFont('helvetica', 'normal');
    const footerText = "The above Service Fee includes all wages and other remuneration payable in respect of Employee's leave entitlements. Associated statutory costs including, but not limited to; FBT, GST, PAYG Withholding Tax, Payroll Tax, Superannuation, Workcover & Public Liability Insurances. Also including the supply of cleaning materials and equipment at the following location.";

    // Split footer text into lines if it's too long
    const splitFooterText = doc.splitTextToSize(footerText, pageWidth - margin * 2);
    splitFooterText.forEach((line: string) => {
        doc.text(line, margin, yOffset);
        yOffset += lineHeight * 0.8; // Smaller line height for footer
    });


    // Save the PDF
    const filename = invoiceData.invoiceNumber
        ? `invoice_${String(invoiceData.invoiceNumber).padStart(4, '0')}_${invoiceData.invoiceStartDate}_to_${invoiceData.invoiceEndDate}.pdf`
        : `invoice_${invoiceData.invoiceStartDate}_to_${invoiceData.invoiceEndDate}.pdf`;
    doc.save(filename);
    //doc.save(`invoice_${invoiceData.invoiceStartDate}_to_${invoiceData.invoiceEndDate}.pdf`);
};


export default function InvoiceGenerator() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  // Add state for invoice date range
  const [invoiceStartDate, setInvoiceStartDate] = useState<string>('');
  const [invoiceEndDate, setInvoiceEndDate] = useState<string>('');
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]); // Array to hold multiple work entries

  // State for the entry currently being added
  const [currentEntryPlaceId, setCurrentEntryPlaceId] = useState<string>('');
  const [isCurrentEntryCasual, setIsCurrentEntryCasual] = useState(false);
  const [currentEntryCasualPlaceName, setCurrentEntryCasualPlaceName] = useState('');
  // Renamed state to reflect it's always an hourly rate input
  const [currentEntryHourlyRate, setCurrentEntryHourlyRate] = useState<number | ''>('');
  const [currentEntryHoursWorked, setCurrentEntryHoursWorked] = useState<number | ''>('');
  // Removed states for days worked fields and extra fields


  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true); // <-- Added loading state for user profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState<number | null>(null);

  // Get the currently selected place object for the entry being added
  const currentSelectedPlace = places.find(p => p.id === currentEntryPlaceId);

  // Fetch list of places when the component mounts
  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase
        // Fetch only id, name, and rate (now treated as default hourly rate)
        .from('places')
        .select('id, name, rate');

      if (error) {
        console.error('Error fetching places:', error);
        setError('Failed to load places.');
      } else {
        setPlaces(data || []);
        // Set a default selected place for the current entry if data is not empty and not casual mode
        if (data && data.length > 0 && !isCurrentEntryCasual) {
            setCurrentEntryPlaceId(data[0].id);
            // Set the default rate from the first place
            setCurrentEntryHourlyRate(data[0].rate);
        }
      }
      setLoadingPlaces(false);
    };

    fetchPlaces();
  }, [isCurrentEntryCasual]); // Refetch places if switching between casual/fixed mode for current entry
  
  // Effect to fetch user profile
  useEffect(() => {
      const fetchUserProfile = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data, error } = await supabase
                  .from('user_profiles')
                  .select('id, full_name, address, contact_number, abn, bsb, account_number') // Select the required fields
                  .eq('id', user.id)
                  .single();

              if (error) {
                  console.error('Error fetching user profile:', error);
                  setError('Failed to load user profile.');
                  setUserProfile({
                      id: user.id,
                      full_name: null,
                      address: null,
                      contact_number: null,
                      abn: null,
                      bsb: null,
                      account_number: null,
                      email: user.email ?? null, //aqui esta el error tambien  <-- Get email from user object
                  });
              } else {
                  setUserProfile({
                    ...data,
                    email: user.email ?? null,
                    }
                    );
              }
          } else {
              // User not logged in, handle accordingly (e.g., redirect)
              setError('User not logged in.');
              router.push('/auth/signin'); // Redirect to sign-in
          }
          setLoadingUserProfile(false);
      };

      fetchUserProfile();
  }, [router]);

  // Effect to update hourly rate when a fixed place is selected
  useEffect(() => {
      if (!isCurrentEntryCasual && currentEntryPlaceId) {
          const place = places.find(p => p.id === currentEntryPlaceId);
          if (place) {
              setCurrentEntryHourlyRate(place.rate);
          }
      } else if (isCurrentEntryCasual) {
          // Clear rate when switching to casual, user will input manually
          setCurrentEntryHourlyRate('');
      }
      // Clear hours worked when switching place type
      setCurrentEntryHoursWorked('');
  }, [currentEntryPlaceId, isCurrentEntryCasual, places]);


  // Reset relevant fields when switching between casual and fixed place for current entry
  useEffect(() => {
      if (isCurrentEntryCasual) {
          setCurrentEntryPlaceId(''); // Clear selected fixed place
          setCurrentEntryCasualPlaceName(''); // Clear casual fields
          setCurrentEntryHourlyRate(''); // Clear rate for manual input
      } else {
          setCurrentEntryCasualPlaceName(''); // Clear casual fields
          // When switching to fixed, set default place and rate if available
          if (places.length > 0) {
              setCurrentEntryPlaceId(places[0].id);
              setCurrentEntryHourlyRate(places[0].rate);
          } else {
              setCurrentEntryPlaceId('');
              setCurrentEntryHourlyRate('');
          }
      }
      setCurrentEntryHoursWorked(''); // Hours worked is used for both
      // Clear date fields for current entry if you add them
      // setCurrentEntryWorkDateStart('');
      // setCurrentEntryWorkDateEnd('');
  }, [isCurrentEntryCasual, places]);

  // Set default invoice date range to the last two weeks on mount
  useEffect(() => {
      const today = new Date();
      const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const twoWeeksAgo = new Date(today.setDate(today.getDate() - 14));
      const startDate = twoWeeksAgo.toISOString().split('T')[0]; // YYYY-MM-DD

      setInvoiceStartDate(startDate);
      setInvoiceEndDate(endDate);
  }, []);


  // Function to add the current entry to the workEntries array
  const handleAddEntry = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // Prevent form submission
      setError(null); // Clear previous errors
      setSuccessMessage(null); // Clear previous success messages
      

      let entryRateType: 'fixed_hourly' | 'casual';
      let entryAmount = 0;
      let entryPlaceId: string | null = null;
      let entryCasualPlaceName: string | null = null;
      const hours = Number(currentEntryHoursWorked);
      const rate = Number(currentEntryHourlyRate);


      // Validation for hours and rate (always required)
      if (currentEntryHoursWorked === '' || isNaN(hours) || hours <= 0) {
          setError('Please enter a valid number of hours worked.');
          return;
      }
      if (currentEntryHourlyRate === '' || isNaN(rate) || rate <= 0) {
           setError('Please enter a valid hourly rate.');
           return;
      }

      if (isCurrentEntryCasual) {
          entryRateType = 'casual';
          entryCasualPlaceName = currentEntryCasualPlaceName.trim();
          if (!entryCasualPlaceName) {
              setError('Please fill in the casual place name.');
              return;
          }
      } else { // Fixed place entry
          entryRateType = 'fixed_hourly';
          entryPlaceId = currentEntryPlaceId;
           if (!entryPlaceId) {
               setError('Please select a place for the entry.');
               return;
          }
          const place = places.find(p => p.id === entryPlaceId);
          if (!place) {
              setError('Selected place for entry not found.');
              return;
          }
          // Use the rate from the input field, not the default place rate
      }

      // Calculate amount (hours * rate)
      entryAmount = hours * rate;

      // Create the new work entry object
      const newEntry: WorkEntry = {
          id: Math.random().toString(36).substring(2, 15), // Simple unique ID for frontend list
          place_id: entryPlaceId,
          casual_place_name: entryCasualPlaceName,
          rate_type: entryRateType,
          hours_worked: hours,
          hourly_rate: rate, // Use the rate from the input field
          amount: entryAmount,
          // work_date_start, work_date_end if you add them
      };

      // Add the new entry to the array
      setWorkEntries([...workEntries, newEntry]);

      // Clear the current entry input fields
      // Keep the current place/casual selection, but clear hours/rate
      setCurrentEntryHoursWorked('');
      // If fixed place is selected, reset rate to default, otherwise clear it
      if (!isCurrentEntryCasual && currentEntryPlaceId) {
           const place = places.find(p => p.id === currentEntryPlaceId);
           if (place) setCurrentEntryHourlyRate(place.rate);
           else setCurrentEntryHourlyRate('');
      } else {
          setCurrentEntryHourlyRate('');
      }
      setCurrentEntryCasualPlaceName(''); // Clear casual name even if staying in casual mode
      // Clear date fields for current entry if you add them
      // setCurrentEntryWorkDateStart('');
      // setCurrentEntryWorkDateEnd('');

      setSuccessMessage('Entry added! Add more or generate invoice.');
      setGeneratedInvoiceNumber(null); // Reset generated invoice number on new entry
  };

    // MODIFICACIÓN: Nueva función para descargar el PDF
  const handleDownloadPdf = () => {
      // Asegúrate de que haya un número de factura generado antes de intentar descargar
      if (generatedInvoiceNumber === null) {
          setError('Please generate the invoice first.'); // Muestra un error si no hay número
          return;
      }

      // Recalcula el total o úsalo desde un estado si lo guardaste
      const totalAmount = workEntries.reduce((sum, entry) => sum + entry.amount, 0);

      // Llama a la función de generación de PDF con los datos necesarios
      generateInvoicePdf({
          invoiceStartDate,
          invoiceEndDate,
          workEntries,
          totalAmount,
          places, // Pasa places si es necesario en generateInvoicePdf
          userProfile, // Pasa user profile si es necesario
          invoiceNumber: generatedInvoiceNumber, // Pasa el número de factura del estado
      });

      // Opcional: Muestra un mensaje de éxito para la descarga
      setSuccessMessage(`Invoice ${String(generatedInvoiceNumber).padStart(4, '0')} PDF downloaded.`);
  };


  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmittingInvoice(true);
    setGeneratedInvoiceNumber(null);

    // Validate invoice date range and that there is at least one entry
    if (!invoiceStartDate || !invoiceEndDate) {
        setError('Please select both invoice start and end dates.');
        setSubmittingInvoice(false);
        return;
    }
     if (new Date(invoiceStartDate) > new Date(invoiceEndDate)) {
        setError('Invoice start date cannot be after the end date.');
        setSubmittingInvoice(false);
        return;
    }
    if (workEntries.length === 0) {
        setError('Please add at least one work entry before generating the invoice.');
        setSubmittingInvoice(false);
        return;
    }

    // Calculate total amount from all entries
    const totalAmount = workEntries.reduce((sum, entry) => sum + entry.amount, 0);

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('User not logged in.');
        setSubmittingInvoice(false);
        router.push('/auth/signin');
        return;
    }

    // Prepare main invoice data
    const mainInvoiceData = {
      user_id: user.id,
      // Store the date range for the invoice
      invoice_date_start: invoiceStartDate,
      invoice_date_end: invoiceEndDate,
      amount: totalAmount, // Total amount from all entries
      status: 'pending',
      // Removed fields that are now in invoice_entries
    };

    // Save the main invoice to the 'invoices' table
    const { data: invoiceResult, error: invoiceError } = await supabase
      .from('invoices')
      .insert([mainInvoiceData])
      .select('id, invoice_number') // Select the ID of the newly created invoice
      .single(); // Get the single result object

    if (invoiceError || !invoiceResult) {
      console.error('Error saving main invoice:', invoiceError);
      setError('Failed to save main invoice.');
      setSubmittingInvoice(false);
      return;
    }

    const newInvoiceId = invoiceResult.id;

    const newInvoiceNumber = invoiceResult.invoice_number; 
    setGeneratedInvoiceNumber(newInvoiceNumber); // Get the generated invoice number

    // Prepare invoice entry data
    const invoiceEntriesData = workEntries.map(entry => ({
        invoice_id: newInvoiceId, // Link each entry to the new invoice
        place_id: entry.place_id,
        casual_place_name: entry.casual_place_name,
        rate_type: entry.rate_type, // Still useful to know if it was fixed or casual
        hours_worked: entry.hours_worked,
        hourly_rate: entry.hourly_rate, // Save the specific hourly rate used for this entry
        amount: entry.amount,
        // Removed daily_rate, days_worked_week_1, days_worked_week_2, extra_description, extra_amount
        // work_date_start, work_date_end if you add them
    }));

    // Save the invoice entries to the 'invoice_entries' table
    const { error: entriesError } = await supabase
        .from('invoice_entries')
        .insert(invoiceEntriesData);

    if (entriesError) {
        console.error('Error saving invoice entries:', entriesError);
        // Decide how to handle this - maybe delete the main invoice if entries fail?
        // For now, just set an error message.
        setError(`Invoice ${newInvoiceNumber} generated, but failed to save work entries.`);
        // You might want to add logic here to clean up the main invoice if entries insertion fails
    } else {
        setSuccessMessage(`Invoice ${newInvoiceNumber} saved successfully! You can now download the PDF.`);
        
        // Clear form and entries
        // Reset date range to default (last two weeks) after successful generation
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const twoWeeksAgo = new Date(today.setDate(today.getDate() - 14));
        const startDate = twoWeeksAgo.toISOString().split('T')[0];
        setInvoiceStartDate(startDate);
        setInvoiceEndDate(endDate);

        
        // Reset current entry fields as well
        setIsCurrentEntryCasual(false);
        setCurrentEntryPlaceId(places.length > 0 ? places[0].id : '');
        setCurrentEntryCasualPlaceName('');
        setCurrentEntryHourlyRate(places.length > 0 ? places[0].rate : ''); // Reset to default rate of first place
        setCurrentEntryHoursWorked('');
    }

    setSubmittingInvoice(false);
  };

  // Function to remove an entry from the workEntries array
  const handleRemoveEntry = (entryId: string) => {
      setWorkEntries(workEntries.filter(entry => entry.id !== entryId));
      setSuccessMessage('Entry removed.'); // Optional feedback
      setGeneratedInvoiceNumber(null); // Reset generated invoice number on entry removal
  };


  if (loadingPlaces || loadingUserProfile) {
    return <div className="p-4">Loading places...</div>;
  }

  // Only show a persistent error if there's no success message
  if (error && !successMessage) {
    return <div className="p-4 text-red-600">{error}</div>;
  }


    return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Generate Invoice</h1>

      {/* Show success/error messages */}
      {successMessage && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">
          {successMessage}
        </div>
      )}
        {error && !successMessage && ( // Show error only if no success message
            <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
            {error}
            </div>
        )}

      {/* Main Invoice Date Range */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Invoice Period</h2>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="invoiceStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="invoiceStartDate"
                  value={invoiceStartDate}
                  onChange={(e) => setInvoiceStartDate(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
            </div>
            <div>
                 <label htmlFor="invoiceEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="invoiceEndDate"
                  value={invoiceEndDate}
                  onChange={(e) => setInvoiceEndDate(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
            </div>
        </div>
      </div>

      {/* Section to Add New Work Entry */}
      <div className="p-4 border rounded-md bg-gray-50 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add Work Entry</h2>

          {/* Option to select fixed place or enter casual */}
          <div className="flex items-center mb-4">
              <input
                  type="checkbox"
                  id="isCurrentEntryCasualCheckbox"
                  checked={isCurrentEntryCasual}
                  onChange={(e) => setIsCurrentEntryCasual(e.target.checked)}
                  className="mr-2"
              />
              <label htmlFor="isCurrentEntryCasualCheckbox" className="text-sm font-medium text-gray-700">Is this a casual place (Otro)?</label>
          </div>

          {/* Place/Casual Name Input (in its own row) */}
          <div className="mb-4"> {/* Added mb-4 for spacing */}
              {!isCurrentEntryCasual ? (
                  <div> {/* Fixed Place Selection */}
                    <label className="block text-sm font-medium text-gray-700">Place</label>
                    <select
                      value={currentEntryPlaceId}
                      onChange={(e) => setCurrentEntryPlaceId(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      required={!isCurrentEntryCasual}
                      disabled={places.length === 0}
                    >
                      {places.length === 0 ? (
                          <option value="">Loading places...</option>
                      ) : (
                          places.map(place => (
                              <option key={place.id} value={place.id}>
                                  {place.name}
                              </option>
                          ))
                      )}
                    </select>
                    {places.length === 0 && !loadingPlaces && (
                        <p className="mt-2 text-sm text-gray-500">No fixed places available.</p>
                    )}
                  </div>
              ) : (
                  <div> {/* Casual Place Input */}
                      <label className="block text-sm font-medium text-gray-700">Casual Place Name</label>
                      <input
                          type="text"
                          value={currentEntryCasualPlaceName}
                          onChange={(e) => setCurrentEntryCasualPlaceName(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          required={isCurrentEntryCasual}
                      />
                  </div>
              )}
          </div>

          {/* Hours Worked and Hourly Rate fields (in a row below) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid for hours and rate */}
              {/* Hours Worked field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentEntryHoursWorked}
                  onChange={(e) => setCurrentEntryHoursWorked(Number(e.target.value))}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  required
                  min="0"
                />
              </div>

               {/* Hourly Rate field */}
               <div>
                   <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                   <input
                       type="number"
                       step="0.01"
                       value={currentEntryHourlyRate}
                       onChange={(e) => setCurrentEntryHourlyRate(Number(e.target.value))}
                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                       required
                       min="0"
                   />
               </div>
          </div>

          {/* Add Entry Button */}
          <button
            onClick={handleAddEntry}
            className="mt-4 w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loadingPlaces || submittingInvoice} // Disable while loading places or submitting invoice
          >
            Add Entry
          </button>
      </div>

      {/* List of Added Work Entries */}
      {workEntries.length > 0 && (
          <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Work Entries ({workEntries.length})</h2>
              <ul className="border rounded-md divide-y divide-gray-200">
                  {workEntries.map(entry => (
                      <li key={entry.id} className="p-3 flex justify-between items-center">
                          <div>
                              {/* Display place name or casual name */}
                              <strong>{entry.casual_place_name || places.find(p => p.id === entry.place_id)?.name || 'Unknown Place'}</strong>
                              {/* Display hours and the specific hourly rate used */}
                              <span className="ml-2 text-sm text-gray-600">({entry.rate_type === 'casual' ? 'Casual' : 'Fixed'})</span><br/>
                              Hours: {entry.hours_worked}, Rate: ${entry.hourly_rate}
                              <br/>
                              Amount: ${entry.amount.toFixed(2)}
                          </div>
                          <button
                              onClick={() => handleRemoveEntry(entry.id)}
                              className="ml-4 text-red-600 hover:text-red-800 text-sm"
                          >
                              Remove
                          </button>
                      </li>
                  ))}
              </ul>
              <p className="mt-2 text-lg font-bold text-right">Total Amount: ${workEntries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}</p>
          </div>
      )}

      {/* MODIFICACIÓN: Botón para Generar (Guarda en DB y obtiene número) */}
      {/* Eliminada la etiqueta <form> que envolvía este botón */}
      <button
        // Eliminado type="submit"
        onClick={handleGenerateInvoice} // Llama a la función que guarda en DB
        disabled={submittingInvoice || workEntries.length === 0 || !invoiceStartDate || !invoiceEndDate} // Disable if submitting, no entries, or no invoice date range
        className={`w-full p-2 rounded text-white ${submittingInvoice || workEntries.length === 0 || !invoiceStartDate || !invoiceEndDate ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {submittingInvoice ? 'Generating Invoice...' : 'Generate Invoice'} {/* Texto del botón */}
      </button>
      {/* Eliminada la etiqueta </form> */}


      {/* MODIFICACIÓN: Botón para Descargar PDF (aparece condicionalmente) */}
      {generatedInvoiceNumber !== null && ( // Show this button only if an invoice number has been generated
          <button
              onClick={handleDownloadPdf} // Llama a la nueva función de descarga (asegúrate de haberla añadido)
              className="mt-4 w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={submittingInvoice} // Disable while submitting the invoice
          >
              Download Invoice {String(generatedInvoiceNumber).padStart(4, '0')} PDF
          </button>
      )}

    </div>
  );
}
