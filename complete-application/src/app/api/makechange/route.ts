import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { checkPermission } from '../../../utils/permit';

// Define different currency coin systems
const currencySystems = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    coins: {
      'hundred dollar bills': 100,
      'fifty dollar bills': 50,
      'twenty dollar bills': 20,
      'ten dollar bills': 10,
      'five dollar bills': 5,
      'one dollar bills': 1,
      'quarters': 0.25,
      'dimes': 0.1,
      'nickels': 0.05,
      'pennies': 0.01,
    }
  },
  CAD: {
    symbol: 'C$',
    name: 'Canadian Dollar',
    coins: {
      'hundred dollar bills': 100,
      'fifty dollar bills': 50,
      'twenty dollar bills': 20,
      'ten dollar bills': 10,
      'five dollar bills': 5,
      'toonies': 2,
      'loonies': 1,
      'quarters': 0.25,
      'dimes': 0.1,
      'nickels': 0.05,
      'pennies': 0.01,
    }
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    coins: {
      'fifty pound notes': 50,
      'twenty pound notes': 20,
      'ten pound notes': 10,
      'five pound notes': 5,
      'two pounds': 2,
      'one pound': 1,
      'fifty pence': 0.5,
      'twenty pence': 0.2,
      'ten pence': 0.1,
      'five pence': 0.05,
      'two pence': 0.02,
      'one penny': 0.01,
    }
  },
  ILS: {
    symbol: '₪',
    name: 'Israeli Shekel',
    coins: {
      'two hundred shekel notes': 200,
      'one hundred shekel notes': 100,
      'fifty shekel notes': 50,
      'twenty shekel notes': 20,
      'ten shekels': 10,
      'five shekels': 5,
      'two shekels': 2,
      'one shekel': 1,
      'fifty agorot': 0.5,
      'ten agorot': 0.1,
    }
  },
  JPY: {
    symbol: '¥',
    name: 'Japanese Yen',
    coins: {
      '10000 yen notes': 10000,
      '5000 yen notes': 5000,
      '1000 yen notes': 1000,
      '500 yen': 500,
      '100 yen': 100,
      '50 yen': 50,
      '10 yen': 10,
      '5 yen': 5,
      '1 yen': 1,
    }
  },
  AUD: {
    symbol: 'A$',
    name: 'Australian Dollar',
    coins: {
      'hundred dollar bills': 100,
      'fifty dollar bills': 50,
      'twenty dollar bills': 20,
      'ten dollar bills': 10,
      'five dollar bills': 5,
      'two dollar coins': 2,
      'one dollar coins': 1,
      'fifty cents': 0.5,
      'twenty cents': 0.2,
      'ten cents': 0.1,
      'five cents': 0.05,
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log(`[MAKECHANGE] Unauthorized request, no valid session`);
      return NextResponse.json(
        { error: 'Unauthorized', permitted: false },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { amount, currency, country } = body;

    if (amount === undefined || !currency) {
      console.log(`[MAKECHANGE] Missing parameters in request`);
      return NextResponse.json(
        { error: 'Missing required parameters', permitted: false },
        { status: 400 }
      );
    }

    console.log(`[MAKECHANGE] User ${session.user.email} requesting change for ${amount} ${currency} from ${country || 'unknown country'}`);

    // Check permission using Permit.io with the country attribute instead of IP-based location
    const permitted = await checkPermission(session.user, 'make', 'change', {
      amount,
      currency,
      country
    });

    if (!permitted) {
      return NextResponse.json(
        { error: 'Not authorized to make change', permitted: false },
        { status: 403 }
      );
    }

    // Process making change
    try {
      const currentCurrency = currencySystems[currency as keyof typeof currencySystems];
      if (!currentCurrency) {
        return NextResponse.json(
          { error: 'Invalid currency', permitted: true },
          { status: 400 }
        );
      }

      const currentCoins = currentCurrency.coins;
      const currencySymbol = currentCurrency.symbol;
      
      let remainingAmount;
      const changeResults = [];

      // For JPY and ILS, work with appropriate scale
      if (currency === 'JPY') {
        remainingAmount = Math.round(amount);
        
        // Sort denominations in descending order
        const sortedCoins = Object.entries(currentCoins).sort((a, b) => b[1] - a[1]);
        
        for (const [name, nominal] of sortedCoins) {
          const count = Math.floor(remainingAmount / nominal);
          remainingAmount = remainingAmount % nominal;
          
          if (count > 0) {
            changeResults.push(`${count} ${name}`);
          }
        }
      } else if (currency === 'ILS') {
        // ILS has larger denominations but still uses decimal points
        remainingAmount = Math.round(amount * 10); // Convert to tenths (agorot)
        
        // Sort denominations in descending order
        const sortedCoins = Object.entries(currentCoins).sort((a, b) => b[1] - a[1]);
        
        for (const [name, nominal] of sortedCoins) {
          const nominalInTenths = Math.round(nominal * 10);
          const count = Math.floor(remainingAmount / nominalInTenths);
          remainingAmount = remainingAmount % nominalInTenths;
          
          if (count > 0) {
            changeResults.push(`${count} ${name}`);
          }
        }
      } else {
        // For decimal currencies (USD, GBP, CAD), convert to cents/pennies
        remainingAmount = Math.round(amount * 100);
        
        // Sort denominations in descending order
        const sortedCoins = Object.entries(currentCoins).sort((a, b) => b[1] - a[1]);
        
        for (const [name, nominal] of sortedCoins) {
          const nominalCents = Math.round(nominal * 100);
          const count = Math.floor(remainingAmount / nominalCents);
          remainingAmount = remainingAmount % nominalCents;
          
          if (count > 0) {
            changeResults.push(`${count} ${name}`);
          }
        }
      }

      // Format the message and result
      let message;
      let formattedAmount;
      
      if (changeResults.length === 0) {
        message = `No change needed for ${currencySymbol}0.00`;
      } else {
        if (currency === 'JPY') {
          formattedAmount = amount.toString();
        } else {
          formattedAmount = amount.toFixed(2);
        }
        message = `We can make change for ${currencySymbol}${formattedAmount} with: ${changeResults.join(', ')}`;
      }

      return NextResponse.json({
        permitted: true,
        message,
        changeResults,
        currencySymbol,
        formattedAmount: currency === 'JPY' ? amount.toString() : amount.toFixed(2)
      });
    } catch (ex: any) {
      return NextResponse.json(
        { error: `There was a problem converting the amount submitted: ${ex.message}`, permitted: true },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in makechange API:', error);
    return NextResponse.json(
      { error: 'Internal server error', permitted: false },
      { status: 500 }
    );
  }
} 