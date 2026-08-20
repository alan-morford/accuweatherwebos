import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.PrintStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Hashtable;
import java.util.Vector;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PushbackInputStream;
import java.io.UnsupportedEncodingException;
import java.io.Writer;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

public class LangBinariesGenerator
{
	private File xlsFile;
	private Vector<String> labels;
	private HSSFSheet sheet;
	private Hashtable<String, byte[]> localizedFiles = new Hashtable<String, byte[]>();
	
	/**
	 * @param args
	 */
	public static void main(String[] args)
	{
		if (args.length > 0) {
			LangBinariesGenerator gen = new LangBinariesGenerator(args[0]);
			gen.convert();
		} else
			System.out.println("No xls file specified.");
	}

	public LangBinariesGenerator(String filename)
	{
		xlsFile = new File(filename);
		if (!xlsFile.exists())
		{
			System.out.println("File '" + filename + "' doesn't exist.");
		}
	}

	public void convert()
	{
		if (xlsFile == null)
			return;
	
		InputStream is = null;
		HSSFWorkbook hw = null;
		try
		{
			is = new FileInputStream(xlsFile);
			hw = new HSSFWorkbook(is);

			sheet = hw.getSheetAt(0);
			
			labels = new Vector<String>();
			DataOutputStream dos;
			String cellValue = "";

			System.out.println("Rows " + sheet.getLastRowNum());

			for (int row = sheet.getFirstRowNum() + 1; row <= sheet.getLastRowNum(); row++)
			{
				HSSFRichTextString txt = sheet.getRow(row).getCell((short) 0).getRichStringCellValue();
				cellValue = txt.getString();
				labels.add(cellValue);
			}

			localizedFiles.put("generated/en.js", extract(1, "en").getBytes("US-ASCII"));
			localizedFiles.put("generated/es.js", extract(2, "es").getBytes("US-ASCII"));
			localizedFiles.put("generated/fr.js", extract(3, "fr").getBytes("US-ASCII"));
			localizedFiles.put("generated/pt.js", extract(4, "pt").getBytes("US-ASCII"));
			localizedFiles.put("generated/it.js", extract(5, "it").getBytes("US-ASCII"));
			localizedFiles.put("generated/de.js", extract(6, "de").getBytes("US-ASCII"));
			save();
		}
		catch (FileNotFoundException ex)
		{
			ex.printStackTrace();
		}
		catch (IOException ex)
		{
			ex.printStackTrace();
		}
		catch (Exception ex) 
		{
			ex.printStackTrace();
		}
	}

	private String extract(int colIndex, String localeName) throws IOException
	{
		StringBuilder b = new StringBuilder();

		b.append("__accuweather_translatons__" + localeName + "= {\n");

		for (int row = sheet.getFirstRowNum() + 1; row <= sheet.getLastRowNum(); row++)
		{
			String cellValue = null;

			if (sheet.getRow(row).getCell((short) colIndex) != null) {
				HSSFRichTextString txt = sheet.getRow(row).getCell((short) colIndex).getRichStringCellValue();
				cellValue = txt.getString();
			} else
				cellValue = labels.get(row - 1);

			b.append('\t');
			insert(b, labels.get(row - 1));
			b.append("\t\t:\t");
			insert(b, cellValue);
//			insert(b, "XXX");

			if (row != sheet.getLastRowNum())
				b.append(',');

			b.append('\n');
		}
		
		b.append('}');
		b.append('\n');
		return b.toString();
	}

	private void insert(StringBuilder b, String str)
	{
		b.append('\"');
		int len = str.length();
		
		for (int i = 0; i < len; i++) {
			char c = str.charAt(i);
			
			b.append("\\u");
			String asHex = Integer.toHexString((int) c);
				
			for (int j = asHex.length(); j < 4; j++)
				b.append('0');
			b.append(asHex);
		}

		b.append('\"');
	}

	private void save() throws FileNotFoundException, IOException
	{
		for (String fileName : localizedFiles.keySet()) {
			FileOutputStream fos = new FileOutputStream(fileName);
			fos.write(localizedFiles.get(fileName));
			fos.close();
		}
	}
}
