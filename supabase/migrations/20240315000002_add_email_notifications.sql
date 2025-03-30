-- Create a function to send email notifications
CREATE OR REPLACE FUNCTION public.handle_new_property_notification()
RETURNS TRIGGER AS $$
DECLARE
  property_owner_email TEXT;
BEGIN
  -- Get the owner's email
  SELECT email INTO property_owner_email
  FROM auth.users
  WHERE id = NEW.listed_by;

  -- Send email notification using Supabase's built-in email service
  PERFORM net.http_post(
    url := CONCAT(
      current_setting('app.settings.supabase_url'),
      '/rest/v1/rpc/send_email'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'to', property_owner_email,
      'subject', CASE 
        WHEN NEW.type = 'sale' THEN 'Your Property Has Been Listed For Sale'
        ELSE 'Your Property Has Been Listed For Rent'
      END,
      'html_content', CONCAT(
        '<h2>Your property has been listed successfully!</h2>',
        '<p>Property details:</p>',
        '<ul>',
        '<li>Title: ', NEW.title, '</li>',
        '<li>Type: ', INITCAP(NEW.type), '</li>',
        '<li>Price: ', CASE 
          WHEN NEW.type = 'sale' THEN CONCAT('₹', NEW.price)
          ELSE CONCAT('₹', NEW.monthly_rent, '/month')
        END,
        '</li>',
        '</ul>',
        '<p>You can view and manage your properties in your <a href="',
        current_setting('app.settings.site_url'),
        '/profile">profile</a>.</p>'
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to send notifications when a new property is listed
CREATE TRIGGER send_new_property_notification
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_property_notification();

-- Create a function to send email when someone shows interest in a property
CREATE OR REPLACE FUNCTION public.send_property_interest_notification(
  property_id UUID,
  interested_user_email TEXT,
  interested_user_name TEXT,
  interested_user_phone TEXT,
  message TEXT
)
RETURNS void AS $$
DECLARE
  property_details RECORD;
  owner_email TEXT;
BEGIN
  -- Get property and owner details
  SELECT p.*, u.email INTO property_details, owner_email
  FROM properties p
  JOIN auth.users u ON p.listed_by = u.id
  WHERE p.id = property_id;

  -- Send email to property owner
  PERFORM net.http_post(
    url := CONCAT(
      current_setting('app.settings.supabase_url'),
      '/rest/v1/rpc/send_email'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'to', owner_email,
      'subject', CONCAT('Someone is interested in your property: ', property_details.title),
      'html_content', CONCAT(
        '<h2>Someone is interested in your property!</h2>',
        '<p>Property: ', property_details.title, '</p>',
        '<p>Interested person details:</p>',
        '<ul>',
        '<li>Name: ', interested_user_name, '</li>',
        '<li>Email: ', interested_user_email, '</li>',
        '<li>Phone: ', interested_user_phone, '</li>',
        '</ul>',
        '<p>Message:</p>',
        '<p>', message, '</p>',
        '<p>You can respond directly to their email address.</p>'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 