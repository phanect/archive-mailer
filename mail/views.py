# Create your views here.
import imaplib, re, email
from django.shortcuts import render_to_response

# list messages in an imap folder
# if start isn't set
def imaplist(imap, folder="INBOX", number=20, start=None):
	# get the list of messages in INBOX
	countup = imap.select(folder, True)
	count = int(countup[1][0])
	if(start==None):
		# default usage, fetch the last number messages from the folder
		start = count-number
		if(start < 0):
			start = 1
		messageset = repr(start)+":*"
	else:
		if(count < number):
			# if there's not at least "number" messages in the folder just list them all
			count = "*"
			start = "1"
		messageset = repr(start+":"+count)
	#return messageset
	status, data = imap.fetch(messageset, "(UID RFC822.SIZE FLAGS BODY[HEADER.FIELDS (SUBJECT DATE FROM)])")
	msglist = []
	for msg in data:
		#msglist.append(repr(msg))
		if(isinstance(msg, tuple)):
			stat, hdr = msg
			#r = re.compile('subject:', re.IGNORECASE)
			msgtext = repr(msg)
			
			# round up all the info we need
			subj = re.search(r'subject:(.*?)\\r\\n', msgtext, re.I)
			fromm = re.search(r'from:(.*?)\\r\\n', msgtext, re.I)
			datee = re.search(r'date:(.*?)\\r\\n', msgtext, re.I)
			uid = re.search(r'UID (.*?) ', msgtext, re.I)
			size = re.search(r'RFC822.SIZE (.*?) ', msgtext, re.I)
			flags = re.search(r'FLAGS \((.*?)\) ', msgtext, re.I)
			
			subjtext = subj.group(1).strip().strip('"')
			fromemail = fromm.group(1).split('<')[1].strip().strip('"').strip('>')
			fromtext = fromm.group(1).split('<')[0].strip().strip('"').replace('\\', '')
			try:
				datetext = datee.group(1).strip().strip('"')
			except:
				datetext = "blank"
			uidtext = uid.group(1).strip().strip('"')
			sizetext = size.group(1).strip().strip('"')
			flagstext = flags.group(1).strip().strip('"')
			
			msglist.append([
				subjtext,
				fromemail,
				fromtext,
				datetext,
				uidtext,
				sizetext,
				flagstext
			])
			#msglist.append(msg) # it's our second match
	return msglist

# TODO leaving index as is for a little bit more development
# index/login page
#def index(request):
#    return render_to_response('mail/index.html', locals())

def index(request):
	imap = imaplib.IMAP4_SSL('mail.theiggy.com')
	imap.login('test', '')
	status, list = imap.list()  # returns status of the command and the results of the command as a list
								# the values are oddly formatted, so we have to do a little bit of parsing
	# get the list of folders
	# we want to break up all the subdirs into nested dicts
	#fldlist = {}
	fldlist = []
	for fld in list:
		folder = fld.split('" "')
		nm = folder[1].strip('"')
		#nm = fld
		fldlist.append(nm)
		#if(nm.count(".")):
			## folders in imap are seperated by .'s
			#for sub in nm.split('.'):
				
				##if not fldlist[sub]:
				#fldlist[sub] = {}
				#fldlist[sub][sub] = ''
			## FIXME handle recursion
			#pass
		#else:
			## if it's a top level folder, just drop it in there empty
			#fldlist[nm] = ''
	maildir = fldlist

	folder = "INBOX"

	msglist = imaplist(imap, folder)
	
	#countup = imap.select()
	#imap.store("1", '-FLAGS', '\\Seen')

	# clean up
	imap.logout()

	return render_to_response('mail/main.html', locals())
		
def msglist(request, folder_name):
	imap = imaplib.IMAP4_SSL('mail.theiggy.com')
	imap.login('test', '')

	msglist = imaplist(imap, folder_name)
	
	# also pass folder_name to the template
	folder = folder_name
	
	# clean up
	imap.logout()
	return render_to_response('mail/msglist.html', locals())


def viewmsg(request, folder, uid):
	imap = imaplib.IMAP4_SSL('mail.theiggy.com')
	imap.login('test', '')
	
	countup = imap.select(folder, True)
	
	mailbody = imap.uid("FETCH", uid, "(BODY[])")
	mailmsg = email.message_from_string(mailbody[1][0][1])
	mail = re.search(r'(.*)^$(.*)', mailbody[1][0][1], re.M)

	header = mail.group(1)
	if not mailmsg.is_multipart():
		body = mailmsg.get_payload()
	else:
		for part in mailmsg.walk():
			if(part.get_content_type() == mailmsg.get_default_type()):
				body = part.get_payload().decode('quopri_codec')
	imap.logout()
	return render_to_response('mail/viewmsg.html', locals())
